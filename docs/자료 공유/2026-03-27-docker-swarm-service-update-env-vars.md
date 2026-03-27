# Docker Swarm에서 `docker service update`로 환경변수 적용하는 방법

Docker Swarm에서 일부 서비스만 빠르게 갱신할 때 `docker service update`를 자주 사용한다.  
이때 헷갈리는 점이 하나 있다. 이미지를 바꾸는 것과 달리 **환경변수는 자동으로 다시 읽혀서 적용되지 않는다**는 점이다.

## 문제

예를 들어 stack으로 배포한 서비스가 있다고 하자.

```bash
docker stack deploy -c compose.yml myapp
```

이후 `.env` 파일이나 `compose.yml`의 `environment:` 값을 수정했다 해도, 다음처럼 서비스만 업데이트하면:

```bash
docker service update myapp_api
```

환경변수는 새로 반영되지 않는다.

## 이유

`docker service update`는 서비스 스펙을 직접 수정하는 명령이다.  
따라서 환경변수를 바꾸려면 그 값도 명령에서 직접 지정해야 한다.

즉, 다음 두 방식은 다르다.

- `docker service update`: 서비스 항목만 직접 수정
    
- `docker stack deploy -c ...`: compose 파일 전체 정의를 다시 적용
    

## 환경변수 반영 방법

### 1. 직접 추가 또는 변경

환경변수는 `--env-add`로 추가하거나 갱신할 수 있다.

```bash
docker service update \
  --env-add FOO=new-value \
  --env-add BAR=123 \
  myapp_api
```

기존 키와 같은 이름으로 넣으면 새 값으로 반영된다.

### 2. 제거 후 다시 추가

기존 값을 명확하게 교체하고 싶다면 제거 후 다시 넣는 방식도 가능하다.

```bash
docker service update \
  --env-rm OLD_KEY \
  --env-add OLD_KEY=new-value \
  myapp_api
```

### 3. 강제로 롤링 재시작

설정 차이가 작거나 확실히 새 태스크를 띄우고 싶다면 `--force`를 사용할 수 있다.

```bash
docker service update \
  --env-add FOO=new-value \
  --force \
  myapp_api
```

## compose 파일 기준으로 다시 맞추고 싶다면

환경변수를 compose 파일이나 `.env` 기준으로 다시 적용하고 싶다면 `docker service update`보다 `docker stack deploy`를 다시 실행하는 편이 맞다.

```bash
docker stack deploy -c compose.yml myapp
```

이 방식은 stack 전체 정의를 다시 읽어 서비스 스펙에 반영한다.

즉 정리하면 다음과 같다.

### 서비스 하나만 빠르게 수정할 때

```bash
docker service update --env-add KEY=value myapp_api
```

### compose 선언 기준으로 다시 배포할 때

```bash
docker stack deploy -c compose.yml myapp
```

## 핵심 정리

`docker service update`를 쓸 때는 환경변수가 자동으로 새로 적용되지 않는다.  
환경변수를 바꾸려면 `--env-add`, `--env-rm`으로 직접 수정해야 한다.

compose 파일이나 `.env`의 변경 사항을 기준으로 다시 맞추고 싶다면 `docker stack deploy -c ...`를 다시 실행해야 한다.

즉:

- 일부 값만 즉시 바꿀 때: `docker service update`
    
- 선언형 설정 전체를 다시 반영할 때: `docker stack deploy`
    

이 차이를 알고 있으면 Swarm에서 서비스 일부만 업데이트할 때 환경변수 반영 문제로 헷갈리지 않는다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._