# Codex CLI에서 Remote Control 활성화하고 모바일로 연결하기

> Codex CLI에서도 `remote_control` feature를 켜고 `codex remote-control`을 실행하면 ChatGPT 모바일 앱에서 실행 중인 호스트에 연결할 수 있다. 핵심은 Codex CLI를 최신 버전으로 올린 뒤 `~/.codex/config.toml`에 `features.remote_control = true`를 설정하고, 연결을 유지할 터미널에서 `codex remote-control`을 실행하는 것이다. 공식 문서에는 CLI 기준 절차가 명확히 정리되어 있지 않지만, 실제로는 이 흐름으로 모바일에서 Codex CLI 세션을 제어할 수 있다.

Codex CLI에는 `remote-control` 명령이 있다.

이 명령을 사용하면 데스크톱이나 서버에서 실행 중인 Codex CLI를 ChatGPT 모바일 앱의 Codex 화면에서 이어서 사용할 수 있다.

공식 문서에서는 Codex App 중심으로 안내하지만, Codex CLI에서도 다음 흐름으로 연결할 수 있다.

```text
1. Codex CLI 업그레이드
2. remote_control feature 활성화
3. codex remote-control 실행
4. ChatGPT 모바일 앱에서 연결
```

## Codex CLI 업그레이드

먼저 Codex CLI를 최신 버전으로 올린다.

```bash
npm i -g @openai/codex@latest
```

설치된 버전을 확인한다.

```bash
codex --version
```

`codex remote-control` 명령이 없는 버전에서는 이 방법을 사용할 수 없다.

## remote_control feature 활성화

Codex 설정 파일을 연다.

```bash
vi ~/.codex/config.toml
```

다음 설정을 추가한다.

```toml
[features]
remote_control = true
```

이미 `[features]` 섹션이 있다면 그 안에 한 줄 추가만 하면 된다.

설정 파일을 저장한 뒤 나온다.

## Codex Remote Control 실행

이제 다음 명령을 실행한다.

```bash
codex remote-control
```

이 명령은 Codex CLI를 원격 제어 가능한 headless 모드로 실행한다.

아무런 출력이 나오지 않겠지만 멈춘 건 아니더라. 이 상태에서 프로세스를 종료하지 않고 유지한다.

## 모바일 앱에서 연결

휴대폰에서 ChatGPT 앱을 연다.

그다음 Codex 화면으로 이동한다.

Codex Remote Control이 정상적으로 실행 중이면 모바일 앱에서 연결 가능한 호스트로 표시된다.

연결하면 모바일 앱에서 데스크톱 또는 서버의 Codex 세션을 제어할 수 있다.

## 연결 후 가능한 작업

모바일 앱에서 다음 작업을 할 수 있다.

- 새 Codex 작업 시작
    
- 기존 작업 이어가기
    
- 추가 지시 입력
    
- Codex가 요청한 승인 처리
    
- 변경 사항 확인
    
- 터미널 출력 확인
    
- 테스트 결과 확인
    

실제 파일 접근, 명령 실행, 개발 환경은 `codex remote-control`을 실행한 호스트 기준으로 동작한다.

즉 모바일 앱은 조작 화면이고, 실제 작업은 Codex CLI가 실행 중인 머신에서 수행된다.

## 실행 상태 유지

`codex remote-control`을 실행한 터미널을 닫으면 연결도 끊긴다.

서버에서 오래 켜두고 싶다면 `tmux`나 `screen`을 사용하는 것이 좋다.

예를 들어 `tmux`에서는 다음처럼 실행할 수 있다.

```bash
tmux new -s codex-remote
codex remote-control
```

터미널에서 빠져나올 때는 `Ctrl + b`를 누른 뒤 `d`를 누른다.

다시 들어갈 때는 다음 명령을 사용한다.

```bash
tmux attach -t codex-remote
```

## 전체 절차 요약

```bash
npm i -g @openai/codex@latest
codex --version
vi ~/.codex/config.toml
codex remote-control
```

`~/.codex/config.toml`에는 다음 설정이 있어야 한다.

```toml
[features]
remote_control = true
```

이후 ChatGPT 모바일 앱의 Codex 화면에서 실행 중인 호스트에 연결하면 된다.

## 정리

Codex CLI에서 Remote Control을 쓰려면 최신 Codex CLI와 `remote_control` feature flag가 필요하다.

핵심은 다음 세 가지다.

```text
features.remote_control = true
codex remote-control
ChatGPT Mobile에서 연결
```

공식 문서에는 아직 CLI 기준 절차가 명확하게 정리되어 있지 않지만, 실제로는 이 방식으로 Codex CLI를 모바일에서 제어할 수 있다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._