# SQLite 벡터 검색이 느릴 때: sqlite-vec 최적화부터 ANN 대안까지

SQLite와 `sqlite-vec`를 사용해 약 30만 개의 임베딩을 검색했지만, 결과가 나오지 않을 정도로 느려지는 문제가 발생했다.

원인은 단순했다. `sqlite-vec`는 별도의 ANN 인덱스를 사용하는 대신 검색 대상 벡터를 직접 비교하는 방식이다. 데이터가 늘거나 벡터 차원이 커질수록 검색 비용도 함께 증가한다.

이 글에서는 다음 순서로 개선 방법을 정리한다.

1. 현재 `sqlite-vec` 사용 방식 점검
    
2. 검색 대상과 벡터 크기 축소
    
3. ANN 인덱스를 지원하는 임베디드 대안 검토
    
4. 메타데이터 필터링 방식 확인
    
5. 상황별 최종 선택
    

## 1. 먼저 `vec0`를 사용하고 있는지 확인한다

일반 SQLite 테이블에서 거리 함수를 직접 호출하면 모든 행의 거리를 계산한 뒤 정렬해야 한다.

```sql
SELECT
    id,
    vec_distance_cosine(embedding, :query) AS distance
FROM documents
ORDER BY distance
LIMIT 10;
```

`sqlite-vec` 공식 문서는 일반 테이블에서 직접 계산하는 방식보다 `vec0` 가상 테이블이 빠르고 저장 공간도 작다고 설명한다.

```sql
CREATE VIRTUAL TABLE document_vectors USING vec0(
    document_id INTEGER PRIMARY KEY,
    embedding FLOAT[768] DISTANCE_METRIC=cosine
);
```

검색은 `MATCH`와 `k`를 사용한다.

```sql
SELECT document_id, distance
FROM document_vectors
WHERE embedding MATCH :query
  AND k = 10;
```

원문 데이터는 벡터 검색이 끝난 후 조인한다.

```sql
WITH matches AS (
    SELECT document_id, distance
    FROM document_vectors
    WHERE embedding MATCH :query
      AND k = 10
)
SELECT
    d.id,
    d.title,
    m.distance
FROM matches AS m
JOIN documents AS d
  ON d.id = m.document_id
ORDER BY m.distance;
```

먼저 큰 테이블을 조인하고 거리 계산을 수행하면 불필요한 계산이 늘어날 수 있다.

## 2. 검색 대상부터 줄인다

30만 개 전체를 검색할 필요가 없다면 메타데이터 조건을 활용해야 한다.

`sqlite-vec`의 `vec0`는 일반 메타데이터 컬럼과 `PARTITION KEY`를 지원한다. 공식 문서는 선택적인 조건에서 partition key가 검색 범위를 줄여 성능을 높일 수 있다고 설명한다.

```sql
CREATE VIRTUAL TABLE document_vectors USING vec0(
    document_id INTEGER PRIMARY KEY,
    project_id INTEGER PARTITION KEY,
    embedding FLOAT[768] DISTANCE_METRIC=cosine
);
```

```sql
SELECT document_id, distance
FROM document_vectors
WHERE embedding MATCH :query
  AND project_id = :project_id
  AND k = 10;
```

다음과 같이 검색마다 항상 사용되는 값이 partition key 후보가 된다.

- `tenant_id`
    
- `project_id`
    
- `repository_id`
    
- `embedding_model`
    
- 큰 범주로 나뉘는 문서 유형
    

행마다 값이 다른 `document_id`처럼 지나치게 세분화된 값은 적합하지 않다.

## 3. 필터 후 후보가 적다면 일반 SQL 검색도 고려한다

복잡한 SQL 조건으로 후보가 수백 개나 수천 개까지 줄어든다면 ANN 인덱스가 없어도 충분히 빠를 수 있다.

```sql
WITH candidates AS MATERIALIZED (
    SELECT id
    FROM documents
    WHERE project_id = :project_id
      AND deleted = 0
      AND created_at >= :start_date
)
SELECT
    e.document_id,
    vec_distance_cosine(e.embedding, :query) AS distance
FROM candidates AS c
JOIN embeddings AS e
  ON e.document_id = c.id
ORDER BY distance
LIMIT 10;
```

이 방식은 다음 조건에서 유리하다.

```text
전체 300,000건
→ SQL 필터 적용
→ 후보 1,000건
→ 1,000개 벡터만 거리 계산
```

필터 이후에도 수십만 건이 남는다면 근본적인 해결책이 되지 않는다.

## 4. 벡터 차원과 저장 형식을 확인한다

전수 검색 비용은 대략 다음 값에 비례한다.

```text
검색 대상 벡터 수 × 벡터 차원
```

30만 개의 float32 벡터가 차지하는 원본 크기는 다음과 같다.

|차원|벡터 원본 크기|
|--:|--:|
|384|약 439 MiB|
|768|약 879 MiB|
|1,536|약 1.72 GiB|
|3,072|약 3.43 GiB|

여기에 SQLite 페이지, 메타데이터와 인덱스 관리 비용이 추가된다.

벡터는 JSON 문자열이나 float64 배열이 아니라 float32 바이너리로 전달하는 것이 좋다. 공식 언어별 예제도 `Float32Array`나 float32 버퍼를 사용한다.

```typescript
const embedding = new Float32Array(values);
```

사용 중인 임베딩 모델이 Matryoshka 임베딩을 지원한다면 차원을 줄이는 방법도 있다. 일반 임베딩을 임의로 자르는 것은 적절하지 않으며, 해당 방식으로 학습된 모델에만 적용해야 한다.

## 5. 여기까지 해도 느리다면 ANN 인덱스가 필요하다

30만 개 전체에서 반복적으로 Top-K를 찾아야 한다면 `sqlite-vec`의 사용 방법만 조정해서는 한계가 있다.

이때는 Approximate Nearest Neighbor, 즉 ANN 인덱스를 검토해야 한다.

|방식|동작 원리|특징|
|---|---|---|
|전수 검색|모든 벡터 비교|정확하지만 데이터 증가에 선형으로 느려짐|
|HNSW|가까운 벡터를 연결한 그래프 탐색|빠르고 정확도가 높지만 메모리 사용|
|DiskANN|SSD에 최적화된 그래프 탐색|대규모 데이터와 낮은 RAM 환경에 적합|
|IVF|벡터 공간을 클러스터로 나누고 일부만 검색|메모리를 절약하지만 학습과 튜닝 필요|
|PQ|벡터를 짧은 코드로 압축|공간 절약, 정확도 손실 가능|

30만 건 규모에서는 일반적으로 HNSW가 가장 단순한 선택이다.

IVF-PQ나 DiskANN은 데이터가 메모리에 들어가지 않거나 수천만 건 이상으로 증가할 때 장점이 커진다.

## 6. 별도 서버 없는 대안

별도의 벡터 DB 서버를 운영하지 않는다는 조건에서는 다음 선택지가 있다.

### Vectorlite

Vectorlite는 SQLite 런타임 확장으로, 내부적으로 `hnswlib` 기반 HNSW 인덱스를 사용한다. Windows, Linux, macOS에서 사용할 수 있으며 SQL 인터페이스를 제공한다.

```sql
CREATE VIRTUAL TABLE document_vectors USING vectorlite(
    embedding float32[768],
    hnsw(
        max_elements=400000,
        M=16,
        ef_construction=150
    )
);
```

장점:

- 기존 SQLite 구조를 유지할 수 있다.
    
- 별도 서버가 필요 없다.
    
- HNSW 인덱스를 사용할 수 있다.
    
- 일반 SQLite 테이블과 `rowid`로 연결할 수 있다.
    

단점:

- 네이티브 확장 파일을 함께 배포해야 한다.
    
- HNSW 인덱스가 메모리를 사용한다.
    
- 복잡한 메타데이터 필터는 `rowid` 집합으로 변환해야 한다.
    

기존 `sqlite-vec` 구조를 가장 적게 변경하려면 우선 검토할 만하다.

### SQLite + USearch

USearch는 애플리케이션 프로세스에서 실행되는 HNSW 라이브러리다. SQLite는 원문과 메타데이터를 관리하고, USearch는 별도 인덱스 파일을 관리한다. 공식 저장소는 필터 조건을 받는 `filtered_search` 인터페이스를 제공한다.

```text
documents.sqlite
vectors.usearch
```

검색 흐름은 다음과 같다.

```text
USearch에서 가까운 ID 검색
→ SQLite에서 해당 ID의 원문 조회
```

장점:

- SQLite를 교체하지 않아도 된다.
    
- HNSW를 직접 제어할 수 있다.
    
- 인덱스를 파일로 저장할 수 있다.
    
- 복잡한 필터링 로직을 애플리케이션에서 구현할 수 있다.
    

단점:

- SQLite와 벡터 인덱스의 동기화를 직접 관리해야 한다.
    
- 삽입이나 삭제 도중 한쪽만 성공하면 불일치가 발생할 수 있다.
    
- 백업과 복구 시 두 파일을 함께 관리해야 한다.
    

벡터가 거의 변경되지 않거나 인덱스를 다시 생성하기 쉬운 구조라면 적합하다.

### libSQL

libSQL은 SQLite 계열 엔진에 벡터 인덱스를 통합한 방식이다.

장점:

- 데이터와 벡터 인덱스를 같은 엔진이 관리한다.
    
- 별도 서버 없이 로컬 파일로 사용할 수 있다.
    
- HNSW보다 메모리 사용을 줄이는 방향에 적합하다.
    

단점:

- 기존 SQLite 드라이버를 libSQL 드라이버로 교체해야 할 수 있다.
    
- 일반 SQLite와 완전히 동일하다고 가정할 수 없다.
    
- 동적 메타데이터 조건에서는 사후 필터링 문제가 생길 수 있다.
    

RAM이 제한적이거나 데이터가 계속 증가할 예정이라면 검토할 수 있다.

## 7. 메타데이터 필터가 있다면 사후 필터링을 확인한다

ANN 검색에서 중요한 것은 인덱스 종류만이 아니다.

다음 쿼리가 있다고 가정한다.

```sql
WHERE project_id = 10
ORDER BY vector_distance
LIMIT 10;
```

구현이 다음 순서라면 문제가 발생한다.

```text
전체 데이터에서 ANN Top 10
→ project_id 조건 적용
→ 조건에 맞지 않는 결과 제거
```

ANN이 찾은 10개 중 조건을 통과한 것이 2개라면 최종 결과도 2개만 반환된다.

조건에 맞는 데이터가 실제로 충분히 있어도 결과가 부족하거나 0개가 될 수 있다.

이를 피하는 방식은 세 가지다.

### 사전 필터링

```text
메타데이터 조건으로 후보 생성
→ 해당 후보에서 벡터 검색
```

후보가 충분히 작다면 가장 확실하다.

### 탐색 중 필터링

```text
HNSW 그래프를 탐색
→ 조건을 만족하는 노드만 결과로 인정
→ K개를 찾을 때까지 탐색
```

Vectorlite의 `rowid` 조건이나 USearch의 predicate가 이 방식과 관련된다.

### 반복 탐색

```text
ANN 후보 검색
→ 필터 적용
→ 결과 부족
→ 탐색 범위 확대
```

pgvector는 0.8.0부터 `iterative_scan`을 지원한다. 필터 때문에 결과가 부족하면 설정된 한도에 도달할 때까지 인덱스를 추가로 탐색한다.

```sql
SET hnsw.iterative_scan = relaxed_order;
```

별도 PostgreSQL 서버가 필요하므로 임베디드 환경에는 맞지 않지만, 메타데이터 필터가 있는 ANN 검색이 어떤 기능을 제공해야 하는지 보여주는 기준이 된다.

## 8. 메타데이터 조건에 따른 선택

|조건|적합한 선택|
|---|---|
|메타데이터 필터 없음|Vectorlite|
|`project_id` 같은 단순 조건|Vectorlite|
|필터 후 후보가 수천 건 이하|sqlite-vec 전수 검색|
|권한, 태그, 날짜, 상태 조합|SQLite + USearch|
|필터 종류가 고정됨|필터별 인덱스 또는 파티션|
|결과 개수 자동 보정 필수|pgvector `iterative_scan`|
|RAM이 매우 부족함|libSQL 계열 검토|

## 9. 최종 권장 순서

30만 건에서 `sqlite-vec` 검색이 지나치게 느리다면 다음 순서로 접근한다.

### 1단계: 현재 쿼리 수정

- 일반 테이블 거리 계산 대신 `vec0` 사용
    
- `MATCH`와 작은 `k` 사용
    
- 벡터 검색 후 원문 조인
    
- float32 바이너리 사용
    

### 2단계: 검색량 축소

- `PARTITION KEY` 적용
    
- SQL 메타데이터 필터로 후보 축소
    
- 필요하면 임베딩 차원 축소
    
- 필터 후 후보가 작으면 정확 검색 유지
    

### 3단계: ANN으로 전환

필터가 단순하다면:

```text
SQLite + Vectorlite HNSW
```

필터가 복잡하고 동적이라면:

```text
SQLite + USearch
```

인덱스 동기화 관리가 부담스럽고 PostgreSQL 운영이 가능하다면:

```text
PostgreSQL + pgvector
```

## 결론

30만 건 자체는 벡터 검색 시스템에서 매우 큰 규모는 아니다.

하지만 `sqlite-vec`처럼 ANN 인덱스 없이 전체 벡터를 비교하면 벡터 차원, 쿼리 구조, 메타데이터 필터에 따라 충분히 느려질 수 있다.

우선 `vec0`, partition key, float32 저장과 선필터링을 적용해야 한다. 그래도 전체 30만 건을 반복해서 검색해야 한다면 HNSW 기반 ANN으로 전환하는 것이 적절하다.

가장 단순한 선택은 다음과 같다.

```text
기존 SQLite 구조를 유지하고 싶다
→ Vectorlite

복잡한 메타데이터 필터가 중요하다
→ SQLite + USearch

별도 DB 운영이 가능하고 자동 반복 탐색이 필요하다
→ pgvector
```

ANN 인덱스를 선택할 때는 검색 속도만 비교하면 안 된다.

다음 항목을 함께 검증해야 한다.

- Recall@K
    
- P50·P95 검색 시간
    
- 인덱스 생성 시간
    
- 인덱스 메모리 사용량
    
- 삽입·삭제 반영 방식
    
- 메타데이터 필터 적용 시점
    
- 결과 부족 시 반복 탐색 여부
    
- 데이터와 인덱스의 동기화 방식
    

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._