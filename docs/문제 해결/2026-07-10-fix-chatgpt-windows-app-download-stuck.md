# ChatGPT Windows 앱 다운로드가 멈출 때 해결 방법

ChatGPT Windows 앱의 Microsoft Store ID는 다음과 같다.

```text
9PLM9XGG6VKS
```

설치는 Microsoft Store 또는 `winget`으로 할 수 있다.

```powershell
winget install --id 9PLM9XGG6VKS --source msstore
```

하지만 Store와 `winget` 모두 `다운로드 중`에서 멈추고 다음 오류가 발생할 수 있다.

```text
Microsoft Store 패키지를 설치하거나 업그레이드하지 못했습니다.
오류 코드: 0x8024001E
```

`0x8024001E`는 Windows Update 관련 서비스가 중단되어 작업을 완료하지 못했다는 뜻이다.

## 가장 먼저 시도할 방법

관리자 권한 PowerShell에서 BITS를 시작한다.

```powershell
Start-Service BITS
```

이후 바로 설치를 다시 실행한다.

```powershell
winget install --id 9PLM9XGG6VKS --source msstore
```

BITS는 Windows의 백그라운드 다운로드를 담당한다. 서비스 시작 유형이 `Manual`이거나 상태가 `Stopped`여도 무조건 비정상은 아니지만, 필요할 때 자동으로 시작되지 않으면 Store 다운로드가 실패할 수 있다.

상태는 다음 명령으로 확인할 수 있다.

```powershell
Get-Service BITS
```

## 그래도 안 될 때

관련 서비스를 확인한다.

```powershell
Get-Service BITS, wuauserv, UsoSvc, DoSvc, InstallService
```

Microsoft Store 캐시도 초기화한다.

```text
Win + R
→ wsreset.exe
```

`winget` 소스를 초기화한 뒤 다시 시도할 수도 있다.

```powershell
winget source reset --force
winget source update
```

마지막으로 Windows Update를 완료하고 재부팅한다.

## 핵심 정리

ChatGPT 앱과 `winget` 설치가 모두 멈추며 `0x8024001E`가 발생한다면 다음 명령부터 시도한다.

```powershell
Start-Service BITS
winget install --id 9PLM9XGG6VKS --source msstore
```

Store 앱 자체가 아니라 Windows의 백그라운드 다운로드 서비스 문제일 수 있다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._