# WSL + Docker Desktop에서 `docker.sock: no such file or directory` 오류 해결

WSL에서 Docker Desktop을 사용 중인데 갑자기 다음 오류가 발생할 수 있다.

```
failed to connect to the docker API at unix:///var/run/docker.sock:
dial unix /var/run/docker.sock: connect: no such file or directory
```

또는 context를 변경했을 때 다음 오류가 나기도 한다.

```
Failed to initialize: protocol not available
```

이 문제는 대부분 **WSL integration이 꺼져 있는 상태**에서 발생한다.

---

# 원인

WSL에서 Docker Desktop을 사용할 때 구조는 다음과 같다.

```
WSL (docker CLI)
      │
      ▼
/var/run/docker.sock  (프록시)
      │
      ▼
Docker Desktop Engine (Windows)
```

WSL 내부에는 Docker daemon이 없다.  
대신 Docker Desktop이 **WSL integration을 통해 `/var/run/docker.sock` 프록시를 제공**한다.

따라서 integration이 꺼져 있으면 다음 상황이 된다.

```
WSL (docker CLI)
      │
      ▼
/var/run/docker.sock ❌ 존재하지 않음
```

그래서 다음 오류가 발생한다.

```
connect: no such file or directory
```

---

# 잘못된 해결 시도: `desktop-linux` context

문제를 해결하려고 다음 명령을 시도할 수 있다.

```bash
docker context use desktop-linux
```

하지만 이 경우 다음 오류가 발생할 수 있다.

```
Failed to initialize: protocol not available
```

이유는 `desktop-linux` context의 endpoint가 다음과 같기 때문이다.

```
npipe:////./pipe/dockerDesktopLinuxEngine
```

이 경로는 **Windows named pipe**이며 WSL 내부에서는 직접 사용할 수 없다.

---

# 해결 방법

## 1. Docker Desktop 실행

먼저 Docker Desktop이 실행 중인지 확인한다.

---

## 2. WSL Integration 활성화

Docker Desktop에서 다음 설정을 확인한다.

```
Settings
 → Resources
   → WSL Integration
```

사용 중인 배포판(Ubuntu 등)을 **체크 활성화**한다.

이미 켜져 있다면 다음 순서로 재적용한다.

1. 체크 해제
    
2. Apply
    
3. 다시 체크
    
4. Apply & Restart
    

---

## 3. context를 default로 복구

WSL에서 다음을 실행한다.

```bash
docker context use default
```

확인:

```bash
docker context ls
```

정상 상태 예시

```
NAME        DESCRIPTION                               DOCKER ENDPOINT
default *   Current DOCKER_HOST based configuration   unix:///var/run/docker.sock
```

---

## 4. 동작 확인

```bash
docker ps
```

정상적으로 컨테이너 목록이 출력되면 문제 해결이다.

---

# 정상적인 WSL + Docker Desktop 구조

정상 상태는 다음과 같다.

```
Docker Desktop: 실행 중
WSL Integration: ON
docker context: default
```

그리고 WSL에서는 그냥 다음 명령을 사용하면 된다.

```bash
docker ps
docker build
docker compose
```

---

# 핵심 정리

문제 원인:

```
WSL integration OFF
→ /var/run/docker.sock 없음
→ docker CLI가 daemon에 연결 실패
```

해결 방법:

```
Docker Desktop
→ WSL Integration 활성화
→ docker context default 사용
```

WSL 환경에서는 `desktop-linux` context를 사용할 필요가 없으며  
**WSL integration + default context 조합이 정상적인 구성이다.**

---

*이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다.*