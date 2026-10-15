# Orca vs T3 Code, 직접 써보고 느낀 차이

평소에는 Windows에서 WSL을 열고 Codex를 사용합니다. [이전에 Orca와 Paseo를 비교한 뒤](./2026-08-18-orca-vs-paseo-for-codex.md), 이번에는 [T3 Code](https://github.com/pingdotgg/t3code)도 사용해 봤습니다.

[Orca](https://github.com/stablyai/orca)와 T3 Code는 여러 Coding Agent를 실행하고 관리하는 도구입니다. 저는 두 프로그램 모두 Codex로 사용했기 때문에, 이 글의 사용 경험도 Codex 기준입니다.

직접 써보니 T3 Code는 확실히 가볍고 채팅 화면이 깔끔했습니다. 반면 파일을 찾아보고 코드를 확인하는 과정은 Orca 쪽이 더 편했습니다.

Orca는 Codex, Claude Code, OpenCode, Pi를 비롯한 여러 CLI Agent를 지원합니다. T3 Code도 v0.0.45에서 Codex, Claude Code, Cursor, Grok Build, OpenCode, Google Antigravity를 지원합니다. 사용할 Agent를 고른 뒤 작업을 관리하는 방식에 차이가 있습니다. [Orca 지원 Agent](https://github.com/stablyai/orca/blob/v1.4.224/README.md), [T3 Code 지원 Agent](https://github.com/pingdotgg/t3code/blob/v0.0.45/README.md)

## 한눈에 비교

| - | Orca | T3 Code |
| --- | --- | --- |
| 성격 | AI Agent 중심 개발 환경 | 대화와 작업 상태 관리 중심 |
| Agent 지원 | 여러 CLI Agent 지원 | 여러 Agent를 provider로 연동 |
| Codex UI | 터미널과 Chat UI 제공 | app-server 기반 Chat UI |
| Worktree | 작업 공간의 중심 | 병렬 작업을 위한 worktree 지원 |
| 파일 탐색 | 에디터 옆에 별도 탐색기 | 탐색기와 파일이 오른쪽 탭에 함께 있음 |
| 작업 정리 | Worktree 중심 | Settle로 확인한 대화 정리 |
| WSL 연결 | 지원, 비교적 간편 | 지원, 연결하기 편했음 |
| 체감 성능 | 상대적으로 무거운 편 | 확실히 가벼운 편 |

기능 설명은 공식 자료를 함께 확인했습니다. 화면 구성과 편의성, 체감 성능은 직접 사용한 기준입니다.

## Orca: 작업 공간 전체를 Agent 중심으로 묶습니다

Orca는 에디터, 터미널, Git, diff, 브라우저와 Agent 관리를 한 프로그램에 넣은 개발 환경입니다.

특히 Git worktree를 적극적으로 사용합니다. 작업마다 브랜치와 파일을 나누고, 각 작업에 필요한 Agent와 터미널을 함께 배치합니다.

```text
Repository
├─ Worktree A
│  ├─ Agent
│  └─ 에디터, 터미널
└─ Worktree B
   ├─ Agent
   └─ 에디터, 브라우저
```

Agent가 작업을 끝내면 같은 공간에서 diff를 확인하고 파일을 수정할 수 있습니다. diff의 특정 줄에 의견을 남긴 뒤 모아서 Agent에게 다시 보내는 기능도 있습니다. [Worktree 문서](https://www.onorca.dev/docs/model/worktrees), [Annotate AI Diff 문서](https://www.onorca.dev/docs/review/annotate-ai-diff)

프론트엔드 작업에는 내장 Chromium과 Design Mode도 있습니다. 실행 중인 페이지에서 요소를 선택해 HTML, CSS와 스크린샷을 Agent에게 전달하는 방식입니다. [Design Mode 문서](https://www.onorca.dev/docs/browser/design-mode)

코드와 실행 결과를 직접 확인하면서 Agent에게 다시 일을 맡기는 흐름이 잘 연결돼 있습니다.

### 파일 탐색기가 따로 있는 것이 편했습니다

Orca에서는 파일 탐색기가 에디터 옆에 따로 남아 있습니다. 파일을 하나 열어 확인하다가 다른 파일을 찾을 때도 탐색기에서 바로 고르면 됩니다.

작은 차이 같지만 여러 파일을 오갈 때는 꽤 편했습니다.

자체 에디터는 Monaco 기반이며 자동 저장을 제공합니다. VS Code의 에디터 엔진을 사용하지만, VS Code의 확장 환경 전체가 들어 있는 것은 아닙니다. [에디터 문서](https://www.onorca.dev/docs/editing/monaco), [파일 탐색기 문서](https://www.onorca.dev/docs/editing/file-explorer)

## T3 Code: 채팅과 작업 정리가 마음에 들었습니다

T3 Code는 채팅 화면이 깔끔합니다. Codex의 대화와 작업 내용을 보기 좋게 정리해서 보여주고, 프로그램도 Orca보다 확실히 가볍게 느껴졌습니다.

여러 작업을 돌려 놓고 결과를 확인하는 용도로는 이쪽이 더 편했습니다.

### Settle로 대화를 정리하는 방식이 좋습니다

T3 Code에서는 끝난 대화를 확인한 뒤 Settle로 정리하는 흐름이 마음에 들었습니다.

진행 중인 작업은 아래에 두고, 제가 확인하거나 대응해야 하는 작업은 위에서 볼 수 있었습니다. 여러 대화가 열려 있어도 지금 무엇을 봐야 하는지 찾기 쉬웠습니다.

왼쪽 사이드바는 이제 Orca와 T3 Code 모두 익숙해졌습니다. 그중 T3 Code의 작업 정리 방식은 마음에 든 부분입니다.

프로젝트별 대화와 worktree, 변경 diff와 commit·push·PR 기능도 갖추고 있습니다. 파일 편집·저장 기능 역시 제공하므로, 채팅만 하고 나머지는 모두 다른 프로그램에서 해야 하는 도구는 아닙니다. [Thread 관리 문서](https://github.com/pingdotgg/t3code/blob/v0.0.45/docs/user/thread-sidebar.md), [소스 관리 문서](https://github.com/pingdotgg/t3code/blob/v0.0.45/docs/user/source-control.md), [v0.0.45 파일 편집 소스](https://github.com/pingdotgg/t3code/blob/v0.0.45/apps/web/src/components/files/FilePreviewPanel.tsx)

### 오른쪽 패널은 아직 불편합니다

문제는 파일을 확인할 때였습니다.

제가 사용한 T3 Code에서는 탐색기 탭과 열어 둔 파일 탭이 같은 위치에 놓였습니다. 파일을 보다가 다른 파일을 열려면 여러 탭 사이에서 탐색기 탭을 다시 찾아야 했습니다.

탭을 선택하려다가 가까이 있는 닫기 버튼을 잘못 누르기도 쉬웠습니다.

```text
T3 Code
파일 확인 → 탐색기 탭 다시 찾기 → 다른 파일 열기

Orca
파일 확인 → 옆에 있는 탐색기에서 다른 파일 열기
```

탐색기와 편집 기능은 있지만, 파일을 계속 오가는 동선은 아쉬웠습니다. 결국 T3 Code를 쓰다가 파일을 찾아보기 위해 VS Code를 다시 열었습니다.

채팅할 때의 편리함이 코드 확인 단계까지 그대로 이어지지는 않았습니다.

## Codex를 연결하는 방식도 살펴봤습니다

T3 Code는 `codex app-server`와 통신해 자체 Chat UI를 구성합니다. Codex CLI를 설치하고, 터미널 화면 대신 프로토콜로 대화와 도구 실행, 승인 요청을 주고받는 방식입니다. [v0.0.45 실행 인자](https://github.com/pingdotgg/t3code/blob/v0.0.45/apps/server/src/provider/Layers/codexLaunchArgs.ts#L12-L15)

Orca는 여러 CLI Agent를 터미널에서 실행할 수 있고, 지원되는 Agent에는 Chat UI도 제공합니다. 공개 릴리스 v1.4.224의 Codex Native Chat 역시 app-server를 사용합니다. [Orca Codex 연결 소스](https://github.com/stablyai/orca/blob/v1.4.224/src/main/codex/codex-structured-session-state.ts)

다만 Orca의 채팅 방식은 실행 환경에 따라 다릅니다. 현재 공식 문서는 지원되는 로컬 환경과 연결된 Orca Server에서 구조화 채팅을 제공하고, WSL·SSH 세션에서는 terminal-backed Chat UI를 사용한다고 설명합니다. Chat UI는 여전히 Experimental로 안내합니다. [Orca Chat UI 문서](https://www.onorca.dev/docs/agents/native-chat)

같은 Codex를 사용해도 어느 환경에서 실행하는지에 따라 화면과 기능에 차이가 생길 수 있습니다.

### `/goal`은 버전을 확인해야 합니다

T3 Code에서 `/goal`을 입력했을 때는 명령으로 인식되지 않았습니다. 그래서 Codex가 의도를 알아들을 것이라고 생각하고 그대로 입력했습니다. 실제 goal 기능이 활성화됐는지까지 확인한 것은 아닙니다.

조사 시점의 최신 stable은 v0.0.45인데, 이후 main 브랜치의 새 adapter에는 `/goal`을 처리하고 `thread/goal/set`을 호출하는 구현이 있습니다. 개발 중인 main과 설치한 배포판을 구분해서 봐야 하는 부분입니다. [T3 Code v0.0.45](https://github.com/pingdotgg/t3code/releases/tag/v0.0.45), [main의 goal 구현](https://github.com/pingdotgg/t3code/blob/42da166d131017335a1158d0b379dd68b8985796/apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts#L6332-L6420)

Orca도 v1.4.224의 구조화 채팅 소스에 goal 설정·일시 정지·재개 API 호출이 있습니다. 두 도구 모두 제가 사용한 환경에서 실제 goal 동작을 검증한 비교는 아닙니다. [Orca goal 구현](https://github.com/stablyai/orca/blob/v1.4.224/src/main/codex/codex-structured-thread-goal.ts)

## WSL 연결은 T3 Code도 편했습니다

이전에 Paseo를 사용할 때는 WSL에 별도 daemon을 띄우는 과정이 번거로웠습니다. T3 Code는 Windows 앱에서 WSL 연결이 편했습니다.

Orca와 T3 Code 모두 WSL의 Codex를 사용할 수 있습니다. T3 Code의 설치 문서는 WSL 안에 Agent CLI를 준비하고, 앱이 서버 런타임을 마련하는 흐름을 안내합니다. 기존 WSL 개발 환경을 계속 사용하려는 경우 둘 다 살펴볼 만합니다. [Orca WSL 문서](https://www.onorca.dev/docs/agents/codex#codex-on-windows-wsl), [T3 Code 설치 문서](https://github.com/pingdotgg/t3code/blob/v0.0.45/docs/user/install.md)

원격과 모바일 기능도 있습니다. Orca는 SSH worktree, Remote Orca Server와 iOS·Android companion을 제공하고, T3 Code의 문서도 원격 서버에 desktop·web·mobile이 연결하는 구성을 설명합니다. Agent와 파일이 있는 호스트가 켜져 있고 연결 가능해야 합니다. [Orca 원격 작업](https://www.onorca.dev/docs/ssh), [Orca 모바일](https://www.onorca.dev/docs/mobile), [T3 Code 원격 연결](https://github.com/pingdotgg/t3code/blob/v0.0.45/docs/user/remote-access.md)

원격·모바일은 자료로 확인한 내용이며 직접 사용 경험으로 비교하지는 않았습니다.

## 그래서 무엇을 선택할까

Orca는 여러 Agent와 worktree를 하나의 개발 환경 안에서 관리하고, 파일과 실행 결과까지 직접 확인하려는 경우에 잘 맞습니다.

- 여러 worktree와 Agent를 한 화면에서 관리
- 별도 탐색기로 파일을 오가며 코드 확인
- diff 검토와 수정 요청을 같은 흐름에서 처리
- 내장 브라우저와 Design Mode 사용

T3 Code는 깔끔한 Chat UI와 작업 정리 방식이 좋았습니다. 기존 VS Code를 함께 사용해도 괜찮다면 가볍게 Agent 작업을 관리하기에 매력적입니다.

- 여러 대화의 진행 상황과 확인할 작업 관리
- Settle로 확인한 대화 정리
- 깔끔한 Codex Chat UI
- 필요할 때 VS Code에서 파일 탐색과 편집

직접 사용해 본 기준으로는 **T3 Code가 더 가볍고 채팅하기 편했지만, 파일을 계속 찾아보고 확인하는 작업은 Orca가 더 편했습니다.**

속도는 측정값이 아닌 체감입니다. 이전 글에서 겪었던 Orca의 불안정성도 최신 버전에서 모두 다시 확인한 것은 아닙니다. Orca는 [릴리스마다 개선](https://github.com/stablyai/orca/releases/tag/v1.4.224)을 이어가고 있고, T3 Code도 [README](https://github.com/pingdotgg/t3code/blob/v0.0.45/README.md)에서 초기 프로젝트이며 버그가 있을 수 있다고 안내합니다.

지금은 한쪽으로 완전히 옮기기보다, 채팅과 작업 관리에서 느끼는 편리함이 코드 확인 단계에서도 이어지는지를 보고 선택하는 것이 좋겠습니다.

---

_자료 확인: 2026년 10월 15일. 공개 stable은 Orca v1.4.224, T3 Code v0.0.45를 확인했습니다. T3 Code의 문서는 v0.0.45에 고정했고, 개발 중인 `/goal` 구현만 main의 42da166 커밋을 인용했습니다. 직접 사용한 앱 버전은 특정하지 않았습니다._

_이 글은 사용 경험과 공식 자료를 바탕으로 AI의 도움을 받아 작성했습니다._
