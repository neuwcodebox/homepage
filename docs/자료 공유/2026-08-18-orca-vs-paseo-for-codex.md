# Codex 병렬 작업 도구 Orca vs Paseo, 직접 써보고 느낀 차이

평소에는 VS Code에서 WSL을 열고 Codex 확장을 사용했습니다. 익숙한 IDE 기능을 그대로 쓰면서 Codex와 대화할 수 있어 큰 불편은 없었지만, 여러 작업을 독립적으로 동시에 돌리려면 세션과 작업 디렉터리를 직접 관리해야 합니다.

이 문제를 해결할 도구로 [Orca](https://github.com/stablyai/orca)와 [Paseo](https://github.com/getpaseo/paseo)를 사용해 봤습니다. 둘 다 Codex, Claude Code 같은 CLI Agent를 여러 개 실행하고 관리하지만 실제 사용 방식은 상당히 다릅니다.

## 한눈에 비교

| -        | Orca                     | Paseo                |
| -------- | ------------------------ | -------------------- |
| 성격       | AI Agent 중심 IDE          | Agent 오케스트레이터        |
| Codex UI | 터미널 기반, Chat UI 제공       | 자체 Chat UI           |
| Worktree | 핵심 기능                    | 지원                   |
| WSL 연결   | 비교적 간편                   | WSL에 별도 daemon 필요    |
| 코드 편집    | 자체 에디터 제공                | 기존 IDE와 병행하기 적합      |
| 브라우저     | 내장 Chromium, Design Mode | 핵심 기능은 아님            |
| 병렬 Agent | 강력함                      | 지원                   |
| 체감 성능    | 무거운 편                    | 비교적 가벼움              |
| 현재 완성도   | 기능은 많지만 불안정한 부분이 있음      | 더 가볍지만 덜 다듬어진 부분이 있음 |

## Orca: IDE 전체를 Agent 중심으로 다시 만든 느낌

Orca는 단순한 Codex GUI가 아닙니다. 에디터, 터미널, Git, diff, 브라우저와 Agent 관리를 한 프로그램에 넣은 개발 환경입니다.

특히 Git worktree를 적극적으로 사용합니다.

```text
Repository
├─ Worktree A
│  └─ Codex
├─ Worktree B
│  └─ Codex
└─ Worktree C
   └─ Claude Code
```

같은 저장소에서 여러 Agent에게 서로 다른 작업을 맡겨도 파일이 충돌하지 않습니다. 같은 문제를 여러 Agent에게 풀게 한 뒤 결과를 비교하는 방식도 자연스럽습니다.

Codex가 작업을 끝내면 diff를 확인하고 특정 줄에 의견을 남겨 다시 수정하게 할 수도 있습니다.

프론트엔드 작업에서는 내장 Chromium과 Design Mode도 유용합니다. 실행 중인 웹 페이지에서 요소를 선택해 HTML, CSS, 화면 정보를 Agent에게 전달할 수 있습니다.

기능만 보면 Orca 쪽이 훨씬 많습니다.

### WSL 사용도 편한 편

Windows에서 WSL에 있는 저장소를 열면 WSL 환경의 Codex와 개발 도구를 사용할 수 있습니다. 별도 daemon을 직접 구성해야 하는 Paseo보다 처음 연결하기는 편했습니다.

기존 환경이 다음과 같다면

```text
Windows
└─ VS Code
   └─ WSL
      ├─ Repository
      └─ Codex
```

Orca에서도 WSL에 있는 저장소와 Codex를 그대로 활용할 수 있습니다.

### 문제는 안정성과 속도

직접 사용했을 때 가장 아쉬웠던 부분입니다.

전체적으로 UI가 무겁게 느껴졌고 터미널이 갑자기 닫히는 경우도 있었습니다. Agent의 기반이 CLI와 PTY에 가까워 터미널 관련 문제가 실제 작업 경험에 직접 영향을 줍니다.

Chat UI도 제공하지만 아직 Experimental 기능입니다. 실제로 Chat UI에서 Codex의 추론 수준을 변경하다가 터미널 화면으로 전환됐고, 다시 Chat UI로 돌아가는 방법이 명확하지 않은 경우도 있었습니다.

Orca의 기능 구성은 매력적이지만 현재는 기능 수에 비해 안정성과 반응 속도가 따라오지 못한다는 느낌을 받았습니다.

## Paseo: IDE가 아니라 Agent 관리 프로그램에 가깝습니다

Paseo는 접근 방식이 다릅니다.

중심에는 Paseo daemon이 있고 Desktop, Web, Mobile, CLI가 여기에 연결됩니다.

```text
Paseo Desktop
       │
       ▼
Paseo daemon
├─ Codex
├─ Claude Code
└─ OpenCode
```

Codex CLI 자체를 터미널 화면으로 보여주기보다 Paseo가 Agent 프로세스를 관리하고 별도의 Chat UI를 제공합니다.

파일이나 이미지를 첨부하고 여러 줄 프롬프트를 입력하는 작업도 일반적인 채팅 애플리케이션에 가깝습니다.

터미널 기반 UI가 불편하다면 이 차이가 꽤 큽니다.

### 확실히 가볍습니다

같은 Windows 환경에서 사용했을 때 Paseo 쪽이 Orca보다 확실히 가볍게 느껴졌습니다.

Paseo는 자체 IDE 전체를 제공하기보다 Agent 관리에 집중합니다. 코드 편집과 탐색은 기존 VS Code에 맡기고 Paseo에서는 Agent만 관리하는 식으로 사용할 수도 있습니다.

```text
VS Code
└─ 코드 편집, 탐색, 디버깅

Paseo
├─ Codex A
├─ Codex B
└─ Worktree
```

기존 VS Code 환경을 굳이 버리고 싶지 않다면 오히려 이 구조가 잘 맞습니다.

### WSL 연결은 Orca보다 번거롭습니다

Windows Paseo Desktop은 기본적으로 Windows에서 자체 daemon을 실행합니다.

WSL 안에 설치된 Codex와 개발 환경을 사용하려면 WSL에도 Paseo daemon을 실행하고 Windows GUI에서 해당 daemon에 연결해야 합니다.

Windows daemon이 기본 포트인 `6767`을 사용한다면 WSL daemon은 다른 포트를 사용할 수 있습니다.

```bash
PASEO_LISTEN=127.0.0.1:6768 paseo daemon start
```

구조는 다음과 같습니다.

```text
Windows
├─ Paseo Desktop
│  └─ Windows daemon :6767
│
└─ localhost:6768
   └─ WSL Paseo daemon
      ├─ WSL Codex
      └─ WSL Repository
```

WSL2의 localhost forwarding을 이용하면 WSL daemon을 `0.0.0.0`으로 외부에 노출하지 않아도 됩니다.

동작하고 나면 단순하지만 처음 설정할 때는 Orca보다 확실히 번거롭습니다.

## Paseo도 아직 완성됐다는 느낌은 아닙니다

가볍다는 장점은 분명했지만 사용하면서는 Orca보다 제품이 덜 다듬어졌다는 인상도 받았습니다.

Orca는 여러 기능이 이미 하나의 개발환경 안에서 연결돼 있습니다. 반면 Paseo는 Agent 관리라는 핵심 기능은 잘 보이지만 WSL host 설정을 비롯해 주변 사용 경험에는 아직 손볼 부분이 있습니다.

결국 두 프로그램의 단점이 반대 방향에 가깝습니다.

```text
Orca
기능과 UX 구성은 풍부함
→ 무겁고 불안정한 부분이 있음

Paseo
구조가 단순하고 가벼움
→ 설정과 주변 UX가 덜 다듬어짐
```

## 그래서 무엇을 선택할까

여러 Agent와 worktree를 하나의 개발환경 안에서 적극적으로 관리하고 싶다면 Orca가 더 적합합니다.

특히 다음 기능이 중요하다면 Orca 쪽이 좋습니다.

- 여러 worktree와 Agent를 한 화면에서 관리
    
- Agent가 만든 diff를 직접 검토
    
- GitHub 작업까지 하나의 흐름으로 처리
    
- 내장 브라우저와 Design Mode 사용
    
- WSL을 별도 daemon 설정 없이 사용
    

반대로 기존 VS Code를 계속 주 IDE로 사용할 생각이고, AI Agent 관리 프로그램은 가볍기를 원한다면 Paseo가 더 잘 맞습니다.

- 기존 VS Code 유지
    
- Codex를 터미널보다 Chat UI로 사용
    
- 여러 Agent를 별도로 실행
    
- 이미지와 파일을 편하게 첨부
    
- 프로그램 자체의 가벼움을 중시
    

직접 사용해 본 기준으로는 **Orca가 더 완성된 제품처럼 보이지만 무겁고 불안정한 부분이 있고, Paseo는 훨씬 가볍지만 아직 덜 다듬어진 부분이 많았습니다.**

따라서 현재는 둘 중 하나로 IDE를 완전히 교체하기보다 기존 `VS Code + Codex` 환경을 유지하면서 병렬 Agent가 필요한 작업에 Orca나 Paseo를 함께 사용하는 방법도 괜찮습니다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._