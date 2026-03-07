# Linux 서버에서 `Driver/library version mismatch` 오류

GPU 서버에서 다음과 같은 오류가 발생할 수 있다.

```
nvidia-smi
Failed to initialize NVML: Driver/library version mismatch
```

또는 CUDA 컨테이너 실행 시 GPU 초기화 단계에서 오류가 발생한다.

```
Driver/library version mismatch
```

이 문제는 **NVIDIA 커널 드라이버와 유저스페이스 라이브러리 버전이 서로 다른 경우** 발생한다.

---

# 발생 상황

문제가 발생한 환경의 버전 상태는 다음과 같았다.

```
커널에 로드된 드라이버: 535.183.01
패키지 라이브러리:     535.274.02
```

즉 다음과 같은 상태였다.

```
Kernel driver      535.183.01
User-space library 535.274.02
```

이 상태에서는 NVML이 커널 드라이버와 통신하지 못하기 때문에  
`nvidia-smi`가 항상 실패한다.

---

# 왜 이런 문제가 발생하는가

대부분 다음 상황에서 발생한다.

```
apt upgrade
→ NVIDIA 드라이버 패키지 업데이트
→ 재부팅 없이 서버 계속 사용
```

즉 시스템 상태는 다음과 같다.

```
디스크: 새 드라이버 라이브러리
커널: 이전 드라이버 모듈
```

CUDA 프로그램이 이미 실행 중이라면 계속 동작할 수 있지만  
**컨테이너 재시작이나 새 GPU 작업 시작 시 바로 실패한다.**

---

# 문제 확인 방법

다음 두 값을 비교하면 된다.

## 커널 드라이버 버전

```
cat /proc/driver/nvidia/version
```

예

```
NVRM version: NVIDIA UNIX x86_64 Kernel Module 535.183.01
```

---

## 설치된 패키지 버전

```
dpkg -l | grep nvidia
```

또는

```
ldconfig -p | grep nvidia
```

예

```
535.274.02
```

---

# 해결 방법

가장 간단한 해결 방법은 **서버 재부팅**이다.

```
sudo reboot
```

재부팅 후 확인

```
nvidia-smi
```

정상 상태 예

```
Driver Version: 535.274.02
CUDA Version: 12.x
```

이때 커널 모듈도 동일 버전으로 로드된다.

---

# 재부팅이 어려운 경우

재부팅이 불가능한 환경에서는 다음 방법이 이론적으로 가능하다.

## 방법 1: NVIDIA 모듈 재로드

```
sudo modprobe -r nvidia_drm nvidia_modeset nvidia_uvm nvidia
sudo modprobe nvidia
```

하지만 다음 이유로 실패하는 경우가 많다.

- GPU 컨텍스트가 이미 생성됨
    
- CUDA 프로세스가 남아 있음
    
- 모듈이 완전히 언로드되지 않음
    

실제 운영 환경에서는 **성공률이 높지 않다.**

---

## 방법 2: 드라이버 패키지 다운그레이드

커널 버전에 맞게 패키지를 내리는 방법이다.

그러나 대부분의 경우 APT 저장소에는 **이전 버전 패키지가 존재하지 않는다.**

---

## 방법 3: runfile로 커널 모듈 재빌드

NVIDIA `.run` 설치 파일을 이용하여 커널 모듈만 다시 빌드하는 방법도 있다.

하지만 다음 문제가 있다.

- 패키지 관리 시스템과 충돌
    
- 운영 환경에서 위험
    
- 추후 업데이트 시 문제 발생 가능
    

따라서 일반적으로 권장되지 않는다.

---

# 현실적인 해결 전략

운영 서버에서는 다음 전략이 가장 안전하다.

```
문제 발생
→ GPU 작업 중지
→ 짧은 다운타임 확보
→ 서버 재부팅
```

재부팅이 가장 빠르고 안정적인 해결 방법이다.

---

# 재발 방지 방법

GPU 서버에서는 NVIDIA 드라이버가 자동 업데이트되면  
동일한 문제가 다시 발생할 수 있다.

따라서 다음 설정을 권장한다.

## NVIDIA 패키지 자동 업데이트 차단

```
sudo apt-mark hold nvidia-driver-535
sudo apt-mark hold libnvidia-*
```

확인

```
apt-mark showhold
```

---

## unattended-upgrades에서 제외

파일 수정

```
/etc/apt/apt.conf.d/50unattended-upgrades
```

추가

```
Unattended-Upgrade::Package-Blacklist {
    "nvidia-*";
    "libnvidia-*";
};
```

---

# 핵심 정리

문제 원인

```
커널 드라이버 ≠ 유저스페이스 라이브러리
```

대표적인 발생 상황

```
apt upgrade
→ NVIDIA 드라이버 업데이트
→ 재부팅 없이 계속 운영
```

가장 안정적인 해결 방법

```
sudo reboot
```

재발 방지

```
apt-mark hold nvidia-driver
또는 unattended-upgrades blacklist
```

GPU 서버에서는 **드라이버 업데이트와 재부팅을 항상 함께 수행**하는 운영 정책이 필요하다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._