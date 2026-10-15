# Orca vs T3 Code, 직접 써보고 느낀 차이

평소에는 Windows에서 WSL을 열고 Codex를 사용합니다. 여러 작업을 동시에 진행할 도구를 찾으면서 [Orca와 Paseo를 비교해 봤고](./2026-08-18-orca-vs-paseo-for-codex.md), 이번에는 T3 Code도 사용해 봤습니다.

[Orca](https://github.com/stablyai/orca)와 [T3 Code](https://github.com/pingdotgg/t3code)는 Codex, Claude Code, OpenCode 등 여러 Coding Agent를 지원합니다. 저는 두 프로그램에 Codex를 연결해 사용했습니다. T3 Code도 Orca처럼 Windows 앱에서 WSL에 연결하기 편했고, 기존 WSL 개발 환경을 그대로 쓸 수 있었습니다. [Orca WSL](https://www.onorca.dev/docs/agents/codex#codex-on-windows-wsl), [T3 Code 설치](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md)

T3 Code를 쓰면서는 채팅 화면과 작업 정리 방식이 마음에 들었습니다. 작업 결과를 확인하려고 파일을 오가기 시작하니 Orca에서 편했던 부분도 보였습니다.

## T3 Code의 가벼움과 작업 정리 방식

두 프로그램 모두 여러 Agent에게 작업을 나눠 맡길 수 있습니다. Orca는 저장소 아래에 worktree를 만들고 그 안에 Agent, 에디터, 터미널과 브라우저를 묶습니다. T3 Code도 프로젝트별 대화와 별도 branch·worktree를 지원합니다. 둘을 사용하면서 눈에 들어온 차이는 **진행 중인 작업과 확인할 결과를 보여주는 방식**이었습니다. [Orca worktree](https://www.onorca.dev/docs/model/worktrees), [T3 Code thread 관리](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md)

T3 Code에서는 진행 중인 작업이 아래에, 제가 확인하거나 대응해야 하는 작업이 위에 놓여 있어 보기 편했습니다. 결과를 확인한 대화는 Settle로 정리하고 다음 작업으로 넘어갈 수 있었습니다.

Settle은 대화를 지우지 않고 활성 목록에서 치우는 기능입니다. 필요하면 다시 꺼낼 수 있어 기록은 남겨두면서 지금 확인할 작업에 집중하기 좋았습니다. [대화 관리 문서](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md)

채팅 화면도 이 흐름에 잘 맞았습니다. T3 Code는 `codex app-server`와 통신하면서 대화, 도구 실행과 승인 요청을 자체 UI로 보여줍니다. 터미널 화면을 그대로 띄우는 대신 대화 내용을 정돈해 보여주는 방식이 마음에 들었습니다. [Agent 연동 문서](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md)

Orca도 지원되는 환경에서는 app-server 기반 Codex Native Chat을 제공합니다. 다만 공식 문서는 WSL·SSH 세션의 Chat UI가 터미널을 기반으로 동작한다고 설명합니다. Orca에서는 Agent를 실행하는 환경에 따라 채팅 방식이 달라집니다. [Chat UI 문서](https://www.onorca.dev/docs/agents/native-chat)

프로그램도 Orca보다 확실히 가볍게 느껴졌습니다. 깔끔한 채팅 화면과 함께 T3 Code에서 마음에 든 부분입니다. 다만 CPU나 메모리를 같은 조건에서 측정한 것은 아니므로, 속도에 대한 평가는 체감입니다.

## 직접 코드를 보기 시작하면 Orca가 편했습니다

Agent가 작업을 끝냈다고 개발이 끝나는 것은 아닙니다. 바뀐 파일을 열어 보고, 주변 코드를 확인하고, 필요한 부분을 다시 수정하게 해야 합니다. 이 단계에서는 Orca의 구성이 더 편했습니다.

Orca는 파일 탐색기가 에디터 옆에 따로 남아 있습니다. 한 파일을 보다가 다른 파일이 궁금하면 옆의 탐색기에서 바로 열면 됩니다. 반면 제가 사용한 T3 Code에서는 탐색기와 열어 둔 파일이 같은 탭 목록에 나란히 놓였습니다. 다른 파일을 찾으려면 여러 탭 사이에서 탐색기 탭부터 다시 찾아야 했고, 탭을 선택하려다 가까이 있는 닫기 버튼을 잘못 누르기도 쉬웠습니다.

여러 파일을 계속 오갈 때는 탐색기 탭을 다시 찾는 과정이 번거로웠습니다. 결국 T3 Code를 쓰다가 파일을 찾아보기 위해 VS Code를 다시 열었습니다. 채팅과 작업 정리는 편했지만, 그 안에서 코드 확인까지 계속하기에는 불편한 부분이 있었습니다.

T3 Code에도 파일 편집과 저장, diff 확인, commit·push·PR 기능은 있습니다. 제가 아쉬웠던 것은 기능의 유무보다 파일 탐색과 편집을 오가는 동선이었습니다. [소스 관리 문서](https://github.com/pingdotgg/t3code/blob/main/docs/user/source-control.md)

Orca는 이런 확인 작업까지 하나의 worktree 안에서 이어가도록 구성돼 있습니다. Monaco 기반 에디터에서 파일을 수정하고, diff의 특정 줄에 남긴 의견을 모아 Agent에게 보낼 수 있습니다. Design Mode에서는 브라우저의 화면 요소를 선택해 HTML, CSS와 스크린샷을 전달할 수도 있습니다. [에디터](https://www.onorca.dev/docs/editing/monaco), [Diff 검토](https://www.onorca.dev/docs/review/annotate-ai-diff), [Design Mode](https://www.onorca.dev/docs/browser/design-mode)

## 그래서 무엇을 선택할까

기존 VS Code를 계속 사용하면서 Agent에게 작업을 맡기고 대화를 정리할 도구를 찾는다면 T3 Code가 잘 맞습니다. 제 경우에도 가벼운 느낌과 깔끔한 Chat UI, Settle로 작업을 정리하는 방식이 좋았습니다.

반대로 Agent가 만든 코드를 직접 자주 살펴보고, 파일 편집과 diff 검토, 브라우저 확인까지 같은 프로그램에서 이어가고 싶다면 Orca가 더 잘 맞습니다. 저는 파일 탐색기가 에디터 옆에 따로 있는 것만으로도 코드를 확인하기가 편했습니다.

두 프로그램 모두 계속 바뀌고 있습니다. 이전 글에 적었던 Orca의 문제를 이번에 모두 다시 확인하지는 않았습니다. T3 Code도 공식 README에서 초기 프로젝트이며 버그가 있을 수 있다고 안내합니다. 기능 목록만으로 완성도를 단정하기보다는 실제 작업을 끝까지 해보는 편이 좋습니다.

제 경우에는 **Agent에게 일을 맡기는 것뿐 아니라 결과를 확인하는 과정까지 편해야 한다는 점**이 가장 크게 남았습니다. 기존 IDE와 함께 쓸지, 한 프로그램 안에서 작업을 끝낼지에 따라 선택도 달라질 것 같습니다.

---

_명령 호환 참고: T3 Code에서 `/goal`이 명령으로 인식되지 않아 Codex가 의도를 알아들을 것이라고 생각하고 그대로 입력했지만, 실제 goal 활성화 여부는 확인하지 않았습니다. [개발 중인 코드에는 goal 연동](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md)이 들어 있지만, 제가 사용한 앱에서의 동작과는 구분해야 합니다._

_원격·모바일은 양쪽 모두 공식 지원을 안내합니다. 실행 호스트가 켜져 있고 연결 가능해야 합니다. [Orca 원격 작업](https://www.onorca.dev/docs/ssh)·[모바일](https://www.onorca.dev/docs/mobile), [T3 Code 원격 연결](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)._

_이 글은 사용 경험과 공식 자료를 바탕으로 AI의 도움을 받아 작성했습니다._
