# T3 Code에서 Windows와 WSL 환경을 모두 모바일로 연결하는 방법

T3 Code는 Windows 데스크톱 앱에서 WSL 환경을 자동으로 구성하고, 두 환경의 프로젝트와 AI 에이전트를 함께 관리할 수 있다.

또한 **T3 Connect**를 이용하면 모바일에서도 데스크톱의 작업 세션에 원격으로 접근할 수 있다.

그런데 Windows 데스크톱에서 Windows와 WSL을 모두 사용하고 있어도, 모바일에서는 Windows 환경만 나타나는 경우가 있다.

이 글에서는 기존 구성을 유지하면서 **WSL 환경도 T3 Connect에 추가 등록하는 방법**을 정리한다.

## 1. 원인

T3 Code는 Windows와 WSL을 별도의 백엔드로 관리한다.

Windows 데스크톱의 `Settings → Connections`에서 T3 Connect를 활성화하면 기본 Windows 환경만 연결될 수 있다.

따라서 WSL 환경에서 실행 중인 서버도 별도로 T3 Connect에 등록해야 한다.

```
Windows PC
├── T3 Code Desktop
│   ├── Windows Backend ── T3 Connect ✓
│   └── WSL Backend ────── T3 Connect ✗
│
└── WSL Ubuntu
    └── Codex / Claude Code 등
```

WSL 백엔드를 새로 설치하거나 별도의 서버로 교체할 필요는 없다. 기존 서버에 원격 연결 설정만 추가하면 된다.

## 2. WSL에 T3 CLI 준비

먼저 WSL Ubuntu 터미널을 열고 다음 명령으로 T3 CLI 설치 여부를 확인한다.

```
command -v t3
```

설치되지 않았다면 공식 설치 스크립트를 실행한다.

```
curl -fsSL https://t3.codes/install.sh | sh
```

설치가 완료되면 다음 명령으로 확인한다.

```
t3 --help
```

## 3. WSL 환경을 T3 Connect에 등록

WSL 터미널에서 다음 명령을 실행한다.

```
t3 connect login --headless
```

터미널에 출력된 인증 링크를 브라우저에서 열어 로그인한다.

**기존 Windows T3 Connect에서 사용하는 계정과 동일한 계정**으로 인증해야 한다.

인증이 완료되면 WSL 환경을 등록한다.

```
t3 connect link --headless
```

이 명령으로 WSL 환경에 T3 Connect 연결 설정이 저장된다.

## 4. T3 Code 재시작

Windows에서 실행 중인 T3 Code 데스크톱 앱을 완전히 종료한 뒤 다시 실행한다.

기존처럼 Windows와 WSL 백엔드가 자동으로 시작되며, WSL 서버는 저장된 T3 Connect 설정을 사용해 원격 연결을 구성한다.

**주의:** WSL에서 별도로 `t3 serve`나 `t3 service install`을 실행할 필요는 없다. 이미 데스크톱 앱이 WSL 서버를 관리하고 있기 때문이다.

## 5. 연결 확인

WSL 터미널에서 다음 명령을 실행한다.

```
t3 connect status
```

환경 연결 상태가 `provisioned`로 표시되는지 확인한다.

단, 이 명령은 저장된 인증 및 연결 설정을 확인하는 용도이며 실제 모바일 접속 가능 여부까지 보장하지는 않는다.

이제 모바일 T3 Code에서 `Settings → Environments`로 이동한다.

정상적으로 등록되었다면 다음 두 환경을 각각 선택할 수 있다.

- **Windows:** 기존 Windows 프로젝트 및 작업 세션
    
- **WSL Ubuntu:** WSL에서 실행 중인 프로젝트 및 작업 세션
    

실제로 위 절차를 적용한 결과, 기존 Windows 연결을 유지하면서 WSL 환경도 모바일에 정상적으로 추가할 수 있었다.

## 정리

Windows 데스크톱에서 WSL을 이미 사용 중이라면 별도의 WSL 서버를 구축할 필요가 없다.

핵심 명령은 다음 세 가지다.

```
# WSL에서 T3 Connect 로그인
t3 connect login --headless

# WSL 환경 등록
t3 connect link --headless

# 연결 상태 확인
t3 connect status
```

이후 Windows T3 Code를 재시작하면 된다.

이렇게 하면 데스크톱에서는 기존처럼 Windows와 WSL을 함께 사용하고, 모바일에서도 두 환경의 작업 세션에 각각 접근할 수 있다.

## 참고 자료

- [T3 Code 공식 GitHub 저장소](https://github.com/pingdotgg/t3code)
    
- [T3 Code 원격 접속 가이드](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)
    
- [T3 Code 설치 및 WSL 지원](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md)
    

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._