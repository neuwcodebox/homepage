# Orca vs T3 Code, 직접 써보고 느낀 차이

평소에는 Windows에서 WSL을 열고 Codex를 사용합니다. 여러 작업을 동시에 진행할 도구를 찾으면서 [Orca와 Paseo를 비교해 봤고](./2026-08-18-orca-vs-paseo-for-codex.md), 이번에는 T3 Code도 사용해 봤습니다.

[Orca](https://github.com/stablyai/orca/blob/v1.4.224/README.md)와 [T3 Code](https://github.com/pingdotgg/t3code/blob/v0.0.45/README.md)는 Codex, Claude Code, OpenCode 등 여러 Coding Agent를 지원합니다. 저는 두 프로그램 모두 Codex로 사용했습니다. Orca에 이어 T3 Code도 Windows 앱에서 WSL 연결이 편해서, 기존 WSL 개발 환경을 그대로 사용하며 비교할 수 있었습니다. [Orca WSL](https://www.onorca.dev/docs/agents/codex#codex-on-windows-wsl), [T3 Code 설치](https://github.com/pingdotgg/t3code/blob/v0.0.45/docs/user/install.md)

T3 Code를 쓰면서는 채팅 화면과 작업 정리 방식이 마음에 들었습니다. 그러다가 결과를 확인하려고 파일을 오가면서 Orca와의 차이도 느꼈습니다. 실제 작업 흐름을 따라가며 비교해 봤습니다.

## T3 Code의 가벼움과 작업 정리 방식

두 프로그램 모두 여러 Agent 작업을 나눠 진행할 수 있습니다. Orca는 저장소 아래에 worktree를 만들고 그 안에 Agent, 에디터, 터미널과 브라우저를 묶습니다. T3 Code도 프로젝트별 대화와 별도 branch·worktree를 지원합니다. 병렬 작업 자체보다 **그 작업들을 어떻게 보여주고 정리하는지**가 더 크게 느껴졌습니다. [Orca worktree](https://www.onorca.dev/docs/model/worktrees), [T3 Code thread 관리](https://github.com/pingdotgg/t3code/blob/v0.0.45/docs/user/thread-sidebar.md)

왼쪽 사이드바는 이제 둘 다 익숙합니다. 그중 T3 Code는 진행 중인 작업을 아래에 두고, 제가 확인하거나 대응해야 하는 작업을 위에서 보는 구성이 편했습니다. 끝난 대화를 확인한 뒤 Settle로 정리하면 다음에 볼 작업도 잘 보였습니다.

Settle은 대화를 삭제하는 것이 아니라 활성 목록에서 정리하는 기능입니다. 필요하면 다시 꺼낼 수 있으므로, 대화 기록을 남기면서 당장 신경 쓸 작업을 줄이는 데 잘 맞습니다. 여러 Agent를 실행하는 것만큼이나 사람이 확인할 순서를 정하는 것이 중요하다는 생각이 들었습니다. [Settle 동작](https://github.com/pingdotgg/t3code/blob/v0.0.45/docs/user/thread-sidebar.md#L113-L141)

채팅 화면도 이 흐름에 잘 맞았습니다. T3 Code는 `codex app-server`와 통신하면서 대화, 도구 실행과 승인 요청을 자체 UI로 보여줍니다. 터미널 화면을 그대로 띄우는 대신 대화 내용을 정돈해 보여주는 방식이 마음에 들었습니다. [Codex 실행 방식](https://github.com/pingdotgg/t3code/blob/v0.0.45/apps/server/src/provider/Layers/codexLaunchArgs.ts#L12-L15)

Orca도 지원되는 환경에서는 app-server 기반 Codex Native Chat을 제공합니다. 다만 현재 공식 문서에서는 WSL·SSH의 Chat UI를 terminal-backed 방식으로 구분하고 있어, 제 WSL 사용 경험과 다른 환경에서의 경험은 다를 수 있습니다. [Orca 연결 소스](https://github.com/stablyai/orca/blob/v1.4.224/src/main/codex/codex-structured-session-state.ts), [Chat UI 문서](https://www.onorca.dev/docs/agents/native-chat)

깔끔한 채팅 화면에 프로그램도 Orca보다 확실히 가볍게 느껴져서 이 부분은 좋았습니다. 다만 CPU나 메모리를 같은 조건에서 측정한 것은 아니므로, 속도에 대한 평가는 체감입니다.

## 직접 코드를 보기 시작하면 Orca가 편했습니다

Agent가 작업을 끝냈다고 개발이 끝나는 것은 아닙니다. 바뀐 파일을 열어 보고, 주변 코드를 확인하고, 필요한 부분을 다시 수정하게 해야 합니다. 이 단계에서는 Orca의 구성이 더 편했습니다.

Orca는 파일 탐색기가 에디터 옆에 따로 남아 있습니다. 한 파일을 보다가 다른 파일이 궁금하면 옆의 탐색기에서 바로 열면 됩니다. 반면 제가 사용한 T3 Code에서는 탐색기 탭과 열어 둔 파일 탭이 같은 위치에 놓였습니다. 다른 파일을 찾으려면 여러 탭 사이에서 탐색기 탭부터 다시 찾아야 했고, 탭을 선택하려다 가까이 있는 닫기 버튼을 잘못 누르기도 쉬웠습니다.

한두 파일만 볼 때보다 여러 파일을 계속 오갈 때 이 차이가 크게 느껴졌습니다. 결국 T3 Code를 쓰다가 파일을 찾아보기 위해 VS Code를 다시 열었습니다. 채팅과 작업 정리는 편했지만, 그 안에서 코드 확인까지 계속하기에는 불편한 부분이 있었습니다.

T3 Code에도 파일 편집과 저장, diff 확인, commit·push·PR 기능은 있습니다. 제가 아쉬웠던 것은 기능의 유무보다 파일 탐색과 편집을 오가는 동선이었습니다. [파일 편집 소스](https://github.com/pingdotgg/t3code/blob/v0.0.45/apps/web/src/components/files/FilePreviewPanel.tsx), [소스 관리 문서](https://github.com/pingdotgg/t3code/blob/v0.0.45/docs/user/source-control.md)

Orca는 이런 확인 작업까지 하나의 worktree 안에서 이어가도록 구성돼 있습니다. 공식 기능으로는 Monaco 기반 편집, diff의 줄별 의견을 모아 Agent에게 보내는 검토 흐름, 브라우저의 화면 요소를 전달하는 Design Mode까지 제공합니다. 제가 편하게 느낀 파일 탐색 구성이 이런 작업들과 연결됩니다. [에디터](https://www.onorca.dev/docs/editing/monaco), [Diff 검토](https://www.onorca.dev/docs/review/annotate-ai-diff), [Design Mode](https://www.onorca.dev/docs/browser/design-mode)

## 그래서 무엇을 선택할까

기존 VS Code를 계속 사용하면서 Agent에게 작업을 맡기고 대화를 정리할 도구를 찾는다면 T3 Code가 잘 맞습니다. 제 경우에도 가벼운 느낌과 깔끔한 Chat UI, Settle로 작업을 정리하는 방식이 좋았습니다.

반대로 Agent가 만든 코드를 직접 자주 살펴보고, 파일 편집과 diff 검토, 브라우저 확인까지 같은 프로그램에서 이어가고 싶다면 Orca가 더 잘 맞습니다. 별도 파일 탐색기가 있는 구성부터 이런 작업에 편했습니다.

두 프로그램 모두 계속 바뀌고 있습니다. 이전 글에서 겪었던 Orca의 불안정성을 최신 버전에서 모두 다시 확인한 것은 아니고, T3 Code도 공식 README에서 초기 프로젝트이며 버그가 있을 수 있다고 안내합니다. 기능 목록만으로 완성도를 단정하기보다는 실제 작업을 끝까지 해보는 편이 좋습니다.

제 경우에는 **Agent에게 일을 맡기는 것뿐 아니라 결과를 확인하는 과정까지 편해야 한다는 점**이 가장 크게 남았습니다. 기존 IDE와 함께 쓸지, 한 프로그램 안에서 작업을 끝낼지에 따라 선택도 달라질 것 같습니다.

---

_명령 호환 참고: T3 Code에서 `/goal`이 명령으로 인식되지 않아 Codex가 의도를 알아들을 것이라고 생각하고 그대로 입력했지만, 실제 goal 활성화 여부는 확인하지 않았습니다. 조사 시점의 stable은 [v0.0.45](https://github.com/pingdotgg/t3code/releases/tag/v0.0.45)이며, 이후 [main에는 goal API 연동 구현](https://github.com/pingdotgg/t3code/blob/42da166d131017335a1158d0b379dd68b8985796/apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts#L6332-L6420)이 있어 설치 버전과 구분해야 합니다._

_원격·모바일은 양쪽 모두 공식 지원을 안내합니다. 실행 호스트가 켜져 있고 연결 가능해야 합니다. [Orca 원격 작업](https://www.onorca.dev/docs/ssh)·[모바일](https://www.onorca.dev/docs/mobile), [T3 Code 원격 연결](https://github.com/pingdotgg/t3code/blob/v0.0.45/docs/user/remote-access.md)._

_자료 확인: 2026년 10월 15일. Orca v1.4.224와 T3 Code v0.0.45의 공개 릴리스·소스 및 공식 문서를 참고했습니다. T3 Code의 `/goal` 구현만 개발 중인 main의 42da166 커밋을 인용했습니다. 직접 사용한 앱 버전은 특정하지 않았습니다._

_이 글은 사용 경험과 공식 자료를 바탕으로 AI의 도움을 받아 작성했습니다._
