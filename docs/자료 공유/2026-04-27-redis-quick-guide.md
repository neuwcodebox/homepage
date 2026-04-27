# Redis 속공 정리: 주요 자료구조와 Stream 활용

Redis는 메모리 기반 key-value 저장소입니다.  
단순 캐시뿐 아니라 카운터, 세션, 큐, 랭킹, 이벤트 스트림 등에 사용할 수 있습니다.

Redis를 빠르게 이해하려면 **자료구조별 명령어**를 먼저 보면 됩니다.

---

## 1. String

가장 기본적인 key-value 자료구조입니다.

```bash
SET user:1 "kim"
GET user:1
DEL user:1
EXISTS user:1
```

만료 시간을 줄 수 있습니다.

```bash
SET token:abc "user-1" EX 3600
EXPIRE user:1 60
TTL user:1
```

숫자 값은 카운터처럼 쓸 수 있습니다.

```bash
SET count 0
INCR count
DECR count
INCRBY count 10
```

주요 용도:

- 캐시
    
- 세션
    
- 토큰
    
- 카운터
    
- 간단한 설정값
    

---

## 2. Hash

하나의 key 아래 여러 field-value를 저장합니다.  
객체 하나를 저장할 때 적합합니다.

```bash
HSET user:1 name "kim" age 20
HGET user:1 name
HGETALL user:1
HDEL user:1 age
```

숫자 필드는 증가시킬 수 있습니다.

```bash
HINCRBY user:1 login_count 1
```

주요 용도:

- 사용자 정보
    
- 세션 상세 정보
    
- 설정 객체
    
- 상태 저장
    

예:

```bash
HSET product:1 name "keyboard" price 30000 stock 10
HGET product:1 price
```

---

## 3. List

순서가 있는 목록입니다.  
왼쪽과 오른쪽에서 push/pop 할 수 있습니다.

```bash
LPUSH jobs job1
RPUSH jobs job2
LPOP jobs
RPOP jobs
LRANGE jobs 0 -1
```

간단한 큐로 쓸 수 있습니다.

```bash
LPUSH jobs job1
BRPOP jobs 0
```

`BRPOP`은 값이 들어올 때까지 대기합니다.

주요 용도:

- 간단한 큐
    
- 최근 로그
    
- 최근 본 항목
    
- 순서가 중요한 목록
    

주의할 점:

- pop 후 처리 실패 시 복구 로직을 직접 설계해야 합니다.
    
- 안정적인 작업 큐가 필요하면 Redis Stream이나 별도 큐 시스템을 검토해야 합니다.
    

---

## 4. Set

중복 없는 집합입니다.

```bash
SADD tags redis cache db
SMEMBERS tags
SISMEMBER tags redis
SREM tags db
SCARD tags
```

집합 연산도 가능합니다.

```bash
SINTER set1 set2
SUNION set1 set2
SDIFF set1 set2
```

주요 용도:

- 태그
    
- 좋아요 누른 사용자 목록
    
- 중복 제거
    
- 권한 집합
    
- 특정 그룹 소속 여부 확인
    

예:

```bash
SADD post:1:likes user:1 user:2
SISMEMBER post:1:likes user:1
SCARD post:1:likes
```

---

## 5. Sorted Set

Set과 비슷하지만 각 member에 score가 있습니다.  
score 기준으로 정렬됩니다.

```bash
ZADD ranking 100 user1
ZADD ranking 200 user2
ZRANGE ranking 0 -1 WITHSCORES
ZREVRANGE ranking 0 -1 WITHSCORES
```

순위를 조회할 수 있습니다.

```bash
ZRANK ranking user1
ZREVRANK ranking user1
```

점수를 증가시킬 수 있습니다.

```bash
ZINCRBY ranking 10 user1
```

score 범위로 조회할 수 있습니다.

```bash
ZRANGEBYSCORE ranking 100 200
```

주요 용도:

- 랭킹
    
- 우선순위 큐
    
- 시간순 인덱스
    
- 만료 대상 관리
    
- 점수 기반 정렬 목록
    

예:

```bash
ZADD recent-events 1710000000000 event1
ZRANGEBYSCORE recent-events 1700000000000 1720000000000
```

---

## 6. Pub/Sub

발행자가 channel에 메시지를 보내고, 구독자가 받는 구조입니다.

```bash
SUBSCRIBE news
```

```bash
PUBLISH news "hello"
```

주요 용도:

- 실시간 알림
    
- 단순 브로드캐스트
    
- 서버 간 가벼운 이벤트 전달
    

주의할 점:

- 메시지가 저장되지 않습니다.
    
- 구독 중이 아니면 메시지를 받을 수 없습니다.
    
- 재처리나 이어받기가 필요하면 적합하지 않습니다.
    

---

## 7. Stream

Redis Stream은 append-only 이벤트 로그입니다.  
메시지를 순서대로 쌓고, 나중에 읽을 수 있습니다.

메시지 추가:

```bash
XADD events * type login userId 123
```

`*`는 Redis가 ID를 자동 생성하라는 뜻입니다.

생성되는 ID는 대략 다음 형태입니다.

```text
1710000000000-0
```

앞부분은 timestamp, 뒷부분은 같은 timestamp 내 sequence입니다.

전체 조회:

```bash
XRANGE events - +
```

최근부터 역순 조회:

```bash
XREVRANGE events + -
```

새 메시지 읽기:

```bash
XREAD COUNT 10 STREAMS events 0
```

새 메시지가 들어올 때까지 대기:

```bash
XREAD BLOCK 5000 STREAMS events $
```

`$`는 현재 이후에 들어오는 새 메시지만 읽겠다는 뜻입니다.

특정 ID 이후부터 읽기:

```bash
XREAD BLOCK 5000 STREAMS events 1710000000000-0
```

이 방식은 연결이 끊긴 뒤 이어받을 때 유용합니다.

---

## 8. Stream Consumer Group

Consumer Group은 여러 소비자가 하나의 Stream을 나누어 처리할 때 사용합니다.

그룹 생성:

```bash
XGROUP CREATE events group1 0 MKSTREAM
```

새 메시지 읽기:

```bash
XREADGROUP GROUP group1 consumer1 COUNT 10 STREAMS events >
```

`>`는 이 그룹에서 아직 아무도 가져가지 않은 새 메시지를 의미합니다.

처리 완료 표시:

```bash
XACK events group1 1710000000000-0
```

처리 중인 메시지 확인:

```bash
XPENDING events group1
```

오래 처리되지 않은 메시지 회수:

```bash
XAUTOCLAIM events group1 consumer2 60000 0-0 COUNT 10
```

주요 용도:

- 이벤트 로그
    
- 재처리 가능한 큐
    
- 여러 worker의 분산 처리
    
- 처리 완료 여부 추적
    

Pub/Sub, List, Stream 차이:

|방식|저장|재처리|분산 처리|용도|
|---|--:|--:|--:|---|
|Pub/Sub|없음|어려움|브로드캐스트|실시간 알림|
|List|일부 가능|직접 구현|가능|단순 큐|
|Stream|있음|가능|좋음|이벤트 로그, 안정적인 큐|

---

## 9. Stream을 작업 큐로 쓰는 구조

Redis Stream은 작업 큐처럼 사용할 수 있습니다.

예를 들어 이미지 처리 작업을 큐에 넣는다고 하면:

```bash
XADD image-jobs * type resize imageId img-1 width 300 height 300
XADD image-jobs * type resize imageId img-2 width 500 height 500
```

워커 그룹을 만듭니다.

```bash
XGROUP CREATE image-jobs image-workers 0 MKSTREAM
```

워커는 그룹에서 작업을 가져옵니다.

```bash
XREADGROUP GROUP image-workers worker-1 COUNT 1 BLOCK 5000 STREAMS image-jobs >
```

작업을 완료하면 ACK 합니다.

```bash
XACK image-jobs image-workers 1710000000000-0
```

이 구조에서 같은 그룹에 여러 워커가 있으면 메시지는 나뉘어 처리됩니다.

```text
image-workers group

worker-1 -> job1
worker-2 -> job2
worker-3 -> job3
```

즉, 하나의 작업을 여러 워커가 중복 처리하는 것이 아니라 **그룹 안에서 분산 처리**합니다.

---

## 10. Stream 작업 큐의 실패 처리

Stream에서 중요한 개념은 Pending입니다.

워커가 메시지를 읽었지만 아직 `XACK`하지 않으면 해당 메시지는 Pending 상태가 됩니다.

```text
읽음
→ 처리 중
→ XACK 전까지 Pending
→ XACK 후 완료
```

Pending 목록을 확인합니다.

```bash
XPENDING image-jobs image-workers
```

상세 조회:

```bash
XPENDING image-jobs image-workers - + 10
```

결과에는 보통 다음 정보가 포함됩니다.

```text
메시지 ID
소유 중인 consumer
마지막 전달 이후 경과 시간
전달 횟수
```

워커가 죽으면 해당 메시지는 계속 Pending에 남습니다.  
다른 워커가 오래된 Pending 메시지를 회수할 수 있습니다.

```bash
XAUTOCLAIM image-jobs image-workers worker-2 60000 0-0 COUNT 10
```

의미:

```text
image-workers 그룹에서
60초 이상 ACK 되지 않은 메시지를
worker-2가 가져와서
다시 처리한다
```

이 구조 덕분에 Stream은 List보다 안정적인 큐로 쓸 수 있습니다.

---

## 11. Stream을 이벤트 로그로 쓰는 구조

Stream은 작업 큐뿐 아니라 이벤트 로그로도 사용할 수 있습니다.

예:

```bash
XADD user-events * type user.created userId 1
XADD user-events * type user.updated userId 1 field name
XADD user-events * type user.deleted userId 1
```

이벤트 전체 조회:

```bash
XRANGE user-events - +
```

특정 시점 이후 조회:

```bash
XRANGE user-events 1710000000000-0 +
```

실시간으로 새 이벤트 대기:

```bash
XREAD BLOCK 5000 STREAMS user-events $
```

이벤트 로그로 쓸 때는 각 메시지를 “현재 상태”가 아니라 “발생한 일”로 저장하는 것이 좋습니다.

좋은 예:

```bash
XADD user-events * type email.changed userId 1 oldEmail a@test.com newEmail b@test.com
```

애매한 예:

```bash
XADD user-events * userId 1 email b@test.com
```

이벤트 타입을 명확히 넣어야 나중에 소비자가 해석하기 쉽습니다.

---

## 12. 여러 서비스가 같은 Stream을 각자 소비하는 구조

하나의 Stream에 이벤트를 쌓고, 여러 Consumer Group이 각자 독립적으로 읽을 수 있습니다.

```text
order-events stream

billing-service group
shipping-service group
notification-service group
```

이벤트 추가:

```bash
XADD order-events * type order.created orderId o-1 userId u-1
```

결제 서비스 그룹:

```bash
XGROUP CREATE order-events billing-service 0 MKSTREAM
XREADGROUP GROUP billing-service billing-worker-1 COUNT 10 STREAMS order-events >
```

배송 서비스 그룹:

```bash
XGROUP CREATE order-events shipping-service 0 MKSTREAM
XREADGROUP GROUP shipping-service shipping-worker-1 COUNT 10 STREAMS order-events >
```

알림 서비스 그룹:

```bash
XGROUP CREATE order-events notification-service 0 MKSTREAM
XREADGROUP GROUP notification-service notification-worker-1 COUNT 10 STREAMS order-events >
```

각 그룹은 자기 위치를 따로 가집니다.

```text
billing-service는 100번까지 처리
shipping-service는 80번까지 처리
notification-service는 120번까지 처리
```

즉, 같은 이벤트를 여러 서비스가 각각 처리할 수 있습니다.  
같은 그룹 안에서는 분산 처리되고, 다른 그룹끼리는 독립적으로 처리됩니다.

---

## 13. Stream ID를 이용한 이어받기

Redis Stream의 메시지 ID는 이어받기에 사용할 수 있습니다.

처음부터 읽기:

```bash
XREAD COUNT 10 STREAMS events 0-0
```

마지막으로 받은 ID가 `1710000000000-0`이라면 그 이후부터 읽기:

```bash
XREAD COUNT 10 STREAMS events 1710000000000-0
```

새 메시지가 들어올 때까지 대기하면서 이어받기:

```bash
XREAD BLOCK 30000 COUNT 10 STREAMS events 1710000000000-0
```

이 방식은 다음 상황에서 유용합니다.

- 로그 뷰어
    
- 실시간 알림 피드
    
- 연결이 끊겼다가 이어받는 클라이언트
    
- 특정 시점 이후 이벤트 동기화
    

단, Stream을 너무 빨리 삭제하면 마지막 ID 이후 이벤트가 이미 사라졌을 수 있습니다.  
이어받기가 중요하면 보존 기간을 충분히 잡아야 합니다.

---

## 14. Stream 보존 관리

Stream은 계속 쌓이기 때문에 보존 정책이 필요합니다.

메시지 추가 시 길이 제한:

```bash
XADD events MAXLEN ~ 10000 * type login userId 1
```

수동 트리밍:

```bash
XTRIM events MAXLEN ~ 10000
```

`~`는 대략적인 제한입니다.  
정확히 10000개로 맞추지는 않지만 성능상 유리합니다.

정확한 제한:

```bash
XTRIM events MAXLEN = 10000
```

일반적으로는 `~`를 많이 씁니다.

주의할 점:

- Consumer Group이 아직 처리하지 않은 메시지도 트리밍될 수 있습니다.
    
- 너무 짧게 보존하면 재처리와 이어받기가 깨질 수 있습니다.
    
- 장기 보관이 필요하면 Redis만 쓰지 말고 DB나 로그 저장소를 함께 고려해야 합니다.
    

---

## 15. Stream 메시지 설계

Stream 메시지는 field-value 쌍입니다.

```bash
XADD events * type login userId 1 ip 127.0.0.1
```

JSON 하나를 넣을 수도 있습니다.

```bash
XADD events * type login payload '{"userId":1,"ip":"127.0.0.1"}'
```

둘 다 가능하지만, 다음 기준으로 고르면 됩니다.

field-value 방식:

```text
Redis CLI에서 보기 쉬움
간단한 이벤트에 적합
필드가 고정적일 때 좋음
```

JSON payload 방식:

```text
구조가 복잡할 때 편함
애플리케이션 코드에서 다루기 좋음
스키마 변경이 상대적으로 쉬움
```

실무에서는 보통 다음처럼 섞어 씁니다.

```bash
XADD events * type order.created version 1 payload '{"orderId":"o-1","userId":"u-1"}'
```

이렇게 하면 이벤트 타입과 버전은 Redis에서 바로 확인할 수 있고, 상세 데이터는 JSON으로 다룰 수 있습니다.

---

## 16. Stream을 쓸 때 조심할 점

### ACK 누락

`XREADGROUP`으로 읽고 `XACK`하지 않으면 Pending이 계속 쌓입니다.

```text
읽기 성공
처리 성공
XACK 누락
→ Redis 입장에서는 아직 처리 중
```

워커 코드에서는 성공 처리 후 반드시 `XACK`해야 합니다.

---

### 중복 처리 가능성

워커가 작업을 처리한 뒤 `XACK` 전에 죽으면, 다른 워커가 같은 메시지를 다시 처리할 수 있습니다.

따라서 Stream 기반 처리는 기본적으로 **at-least-once**로 보는 것이 안전합니다.

```text
최소 한 번 처리
→ 경우에 따라 중복 처리 가능
```

그래서 처리 로직은 가능하면 idempotent하게 만들어야 합니다.

예:

```text
이미 처리한 messageId인지 확인
같은 orderId에 대해 중복 결제 방지
상태 전이를 조건부로 수행
```

---

### 너무 큰 payload

Redis는 메모리 기반입니다.  
큰 데이터를 Stream에 그대로 넣으면 메모리 부담이 커집니다.

큰 데이터는 DB나 object storage에 저장하고, Stream에는 참조값만 넣는 것이 좋습니다.

```bash
XADD events * type file.uploaded fileId file-1 path /files/file-1
```

---

### Kafka 대체재로 과신하지 않기

Redis Stream은 Kafka와 비슷한 면이 있지만 같은 시스템은 아닙니다.

Redis Stream이 적합한 경우:

```text
Redis를 이미 사용 중이다
가벼운 이벤트 큐가 필요하다
작업 재처리가 필요하다
긴 보관 기간은 필요 없다
운영 복잡도를 낮추고 싶다
```

Kafka가 더 적합한 경우:

```text
대규모 이벤트 처리량이 필요하다
장기 보관이 필요하다
파티셔닝과 리밸런싱이 중요하다
이벤트 플랫폼을 여러 팀이 공유한다
```

---

## 17. Key 관리

key 존재 확인:

```bash
EXISTS user:1
```

key 타입 확인:

```bash
TYPE user:1
```

key 이름 변경:

```bash
RENAME oldkey newkey
```

패턴 검색:

```bash
SCAN 0 MATCH user:* COUNT 100
```

운영 환경에서는 다음 명령을 주의해야 합니다.

```bash
KEYS *
```

`KEYS`는 전체 key를 한 번에 훑습니다.  
key가 많으면 Redis를 막을 수 있습니다.  
운영 환경에서는 보통 `SCAN`을 사용합니다.

---

## 18. 만료 시간

Redis는 key 단위로 TTL을 줄 수 있습니다.

```bash
SET session:1 "data" EX 3600
TTL session:1
EXPIRE session:1 60
PERSIST session:1
```

주요 용도:

- 캐시 자동 삭제
    
- 로그인 세션 만료
    
- 임시 토큰 만료
    
- rate limit 윈도우 관리
    

---

## 19. Transaction

여러 명령을 묶어서 실행할 수 있습니다.

```bash
MULTI
INCR count
EXPIRE count 60
EXEC
```

Redis Transaction은 일반적인 RDB 트랜잭션과 다릅니다.  
명령들을 큐에 쌓았다가 `EXEC` 시점에 순서대로 실행합니다.

---

## 20. Lua Script

복합 연산을 원자적으로 처리하고 싶을 때 Lua script를 사용할 수 있습니다.

```bash
EVAL "return redis.call('GET', KEYS[1])" 1 mykey
```

예를 들어 값 확인 후 삭제 같은 로직을 한 번에 처리할 수 있습니다.

```bash
EVAL "
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
else
  return 0
end
" 1 lock:job token
```

주요 용도:

- 분산 락 해제
    
- race condition 방지
    
- 여러 Redis 명령의 원자적 실행
    

---

## 21. 자주 쓰는 실무 패턴

### 캐시

```bash
SET user:1 '{"name":"kim"}' EX 300
GET user:1
```

### 카운터

```bash
INCR api:count
EXPIRE api:count 60
```

### 분산 락

```bash
SET lock:job1 token NX EX 30
```

해제는 token을 확인하고 삭제해야 안전합니다.

### 단순 큐

```bash
LPUSH jobs job1
BRPOP jobs 0
```

### 랭킹

```bash
ZINCRBY ranking 10 user1
ZREVRANGE ranking 0 9 WITHSCORES
```

### 이벤트 로그

```bash
XADD events * type signup userId 123
XRANGE events - +
```

### 재처리 가능한 작업 큐

```bash
XADD jobs * type send-email userId 123
XREADGROUP GROUP workers worker-1 COUNT 1 BLOCK 5000 STREAMS jobs >
XACK jobs workers 1710000000000-0
```

---

## 22. 자료구조별 감각

|자료구조|한 줄 설명|대표 용도|
|---|---|---|
|String|기본 key-value|캐시, 카운터|
|Hash|객체 저장|사용자 정보, 세션|
|List|순서 있는 목록|단순 큐, 최근 목록|
|Set|중복 없는 집합|태그, 좋아요, 권한|
|Sorted Set|score 기준 정렬 집합|랭킹, 시간순 인덱스|
|Pub/Sub|저장 없는 실시간 메시지|알림, 브로드캐스트|
|Stream|저장되는 이벤트 로그|이벤트 처리, 재처리 가능한 큐|

---

## 23. 빠른 판단 기준

Redis를 캐시로 쓸 때:

```text
String + EX
```

객체 하나를 저장할 때:

```text
Hash
```

중복 없는 목록이 필요할 때:

```text
Set
```

순위가 필요할 때:

```text
Sorted Set
```

간단한 큐가 필요할 때:

```text
List
```

처리 이력, ACK, 재처리가 필요할 때:

```text
Stream + Consumer Group
```

실시간 브로드캐스트만 필요할 때:

```text
Pub/Sub
```

---

## 핵심 정리

Redis는 단순 key-value 저장소가 아니라 여러 자료구조를 제공하는 인메모리 데이터 저장소입니다.

가장 먼저 익혀야 할 감각은 다음입니다.

```text
String      = 캐시, 카운터
Hash        = 객체
List        = 단순 큐
Set         = 중복 없는 집합
Sorted Set  = 랭킹, 정렬 인덱스
Pub/Sub     = 실시간 브로드캐스트
Stream      = 이벤트 로그, 재처리 가능한 큐
```

Stream은 특히 다음 요구사항이 있을 때 유용합니다.

```text
메시지를 저장해야 한다
끊긴 뒤 이어받아야 한다
여러 worker가 나누어 처리해야 한다
처리 완료 여부를 추적해야 한다
실패한 작업을 다시 처리해야 한다
```

Redis를 잘 쓰려면 “어떤 명령이 있는가”보다  
**데이터의 성격에 맞는 자료구조를 고르는 것**이 더 중요합니다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._