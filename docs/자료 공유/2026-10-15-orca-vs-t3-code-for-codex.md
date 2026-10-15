# Orca vs T3 Code, 직접 써보고 느낀 차이

여러 Coding Agent에게 작업을 맡기다 보면 대화창을 여러 개 여는 것만으로는 부족합니다. 작업별로 파일을 분리하고, Agent가 어디까지 진행했는지 확인하고, 끝난 결과를 검토할 수 있어야 합니다.

[Orca](https://github.com/stablyai/orca)와 [T3 Code](https://github.com/pingdotgg/t3code)는 이런 작업을 관리하는 도구입니다. 둘 다 Codex, Claude Code, OpenCode 등 여러 Agent를 지원하며, 저는 Windows + WSL 환경에서 Codex를 연결해 사용했습니다. [앞서 Orca와 Paseo를 비교한 글](./2026-08-18-orca-vs-paseo-for-codex.md)에 이어, 이번에는 T3 Code와의 차이를 정리했습니다.

직접 사용해 보니 **T3 Code는 가볍고 대화와 작업을 정리하기 편했고, Orca는 파일을 살펴보며 작업을 이어가기 편했습니다.** 같은 Agent를 사용하더라도 어느 쪽이 더 잘 맞는지는 사람이 코드를 확인하고 수정하는 방식에 따라 달라집니다.

| 비교 기준 | Orca | T3 Code |
| --- | --- | --- |
| 작업 구성 | Worktree 안에 Agent와 개발 도구를 함께 배치 | 프로젝트별 대화와 작업 상태 중심 |
| 병렬 작업 | Worktree로 작업 공간 분리 | 별도 branch·worktree 지원 |
| 파일 확인 | 에디터 옆의 별도 탐색기로 파일 이동 | 탐색기와 열린 파일을 탭으로 전환 |
| WSL | Windows 앱에서 연결 가능 | Windows 앱에서 연결 가능 |
| 직접 느낀 장점 | 파일 탐색과 검토 동선 | 가벼운 느낌, 깔끔한 Chat UI와 Settle |

## 작업 공간을 관리하는 Orca, 대화를 정리하기 편한 T3 Code

Orca는 작업 하나에 필요한 개발 환경을 통째로 묶는 방식입니다. 저장소에서 [worktree](https://www.onorca.dev/docs/model/worktrees)를 만들고 그 안에 Agent, 에디터, 터미널과 브라우저를 배치합니다. 다른 작업으로 옮겨가면 그 작업의 파일과 도구를 함께 볼 수 있습니다.

T3 Code도 [프로젝트별 대화와 worktree](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md)를 지원합니다. 여러 Agent에게 서로 다른 작업을 맡기기 위한 기본 구성은 양쪽 모두 갖추고 있습니다. 다만 T3 Code를 사용하면서 특히 좋았던 것은 작업을 확인하고 정리하는 방식이었습니다.

진행 중인 작업은 아래에, 제가 확인하거나 대응해야 하는 작업은 위에 놓여 있어 보기 편했습니다. 결과를 확인한 대화는 Settle로 정리하고 다음 작업으로 넘어갈 수 있었습니다. Settle은 대화를 지우지 않고 활성 목록에서 치우는 기능이라, 기록을 남겨두면서 당장 볼 작업만 추리기에 좋습니다.

Chat UI도 깔끔합니다. T3 Code는 Codex의 app-server와 통신해 대화, 도구 실행과 승인 요청을 자체 화면으로 보여줍니다. 대화 내용이 정돈돼 있어 읽고 지시하기 편했고, 프로그램도 Orca보다 확실히 가볍게 느껴졌습니다. 성능을 수치로 측정한 것은 아니지만, 사용하면서 체감한 차이는 분명했습니다.

Orca에도 [구조화된 Chat UI](https://www.onorca.dev/docs/agents/native-chat)가 있고 Codex 연결에 app-server를 사용합니다. 다만 WSL·SSH 세션의 Chat UI는 터미널을 기반으로 동작한다고 안내합니다. 따라서 둘의 차이를 단순히 CLI와 app-server의 차이로 나누기보다는, 자신이 사용할 환경에서 채팅과 작업 관리가 얼마나 편한지를 보는 편이 좋습니다.

다만 CLI에서 쓰던 명령이 그대로 통하는 것은 아니었습니다. T3 Code에 `/goal`을 입력했지만 명령으로 인식되지 않았고, 일단 Codex가 뜻을 알아듣길 기대하며 사용했습니다. 개발 중인 [goal 연동](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md)이 실제 UI에 반영되면 이 부분은 나아질 여지가 있습니다.

## 파일을 직접 확인할 때는 Orca의 구성이 편했습니다

Agent가 결과를 내놓으면 바뀐 파일뿐 아니라 주변 코드도 살펴보게 됩니다. 여러 파일을 오가며 구현을 확인하고, 필요한 부분을 다시 수정하도록 요청하는 과정입니다. 이때는 작은 화면 구성 차이가 반복해서 영향을 줍니다.

Orca는 파일 탐색기가 에디터 옆에 따로 남아 있습니다. 한 파일을 보다가 다른 파일을 확인하려면 옆의 탐색기에서 바로 열면 됩니다. 반면 제가 사용한 T3 Code에서는 탐색기와 열어 둔 파일이 같은 탭 목록에 나란히 놓였습니다. 다른 파일을 찾으려면 탐색기 탭부터 다시 찾아야 했고, 탭을 선택하려다 가까이 있는 닫기 버튼을 잘못 누르기도 쉬웠습니다.

이 동선이 번거로워 결국 T3 Code를 쓰다가 VS Code를 다시 열었습니다. 채팅으로 작업을 맡기는 동안에는 편했지만, 파일 탐색까지 T3 Code 안에서 계속하기는 불편했습니다.

T3 Code에 편집 기능이 없는 것은 아닙니다. 파일 편집과 저장은 물론 [diff 확인, commit·push·PR](https://github.com/pingdotgg/t3code/blob/main/docs/user/source-control.md)도 지원합니다. 다만 기능이 있다는 것과 여러 파일을 반복해서 확인하기 편하다는 것은 별개였습니다.

Orca는 [Monaco 기반 에디터](https://www.onorca.dev/docs/editing/monaco)와 [줄별 diff 의견을 Agent에게 보내는 기능](https://www.onorca.dev/docs/review/annotate-ai-diff)을 제공합니다. 프론트엔드 작업이라면 내장 Chromium의 [Design Mode](https://www.onorca.dev/docs/browser/design-mode)로 화면 요소의 HTML, CSS와 스크린샷을 전달할 수도 있습니다. 파일을 살펴보고, 수정할 부분을 짚고, 실행 결과를 확인하는 작업을 같은 공간에서 이어가기 위한 구성입니다.

## 기존 IDE와 함께 쓸지에 따라 선택이 달라집니다

기존 VS Code를 계속 사용하면서 Agent 작업을 가볍게 관리하고 싶다면 T3 Code가 잘 맞습니다. 대화와 작업 상태를 T3 Code에서 확인하고, 파일을 자세히 탐색하거나 편집할 때는 익숙한 IDE를 사용하는 방식입니다. 제 경우에도 깔끔한 Chat UI와 Settle은 장점으로 남았습니다.

반대로 Agent가 만든 코드를 직접 자주 살펴보고, 파일 편집과 diff 검토, 브라우저 확인까지 한 프로그램에서 이어가고 싶다면 Orca가 더 잘 맞습니다. 여러 worktree에 필요한 도구를 함께 두는 구성이 유용하고, 저는 별도 파일 탐색기가 있는 것부터 편했습니다.

제가 사용하는 Windows + WSL 환경에서는 두 프로그램 모두 연결이 편했습니다. [Orca](https://www.onorca.dev/docs/agents/codex)와 [T3 Code](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md) 모두 WSL 환경을 지원하므로 기존 저장소와 개발 도구를 그대로 활용할 수 있습니다. 공식 문서상 [Orca의 원격 작업](https://www.onorca.dev/docs/ssh)·[모바일](https://www.onorca.dev/docs/mobile), [T3 Code의 원격 연결](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)도 지원합니다. 이 경우에는 Agent가 실행되는 호스트가 켜져 있고 연결 가능해야 합니다.

완성도도 함께 봐야 합니다. Orca는 Native Chat을 실험적 기능으로 안내하고, T3 Code도 아직 초기 프로젝트이며 버그가 있을 수 있다고 설명합니다. 필요한 기능이 있더라도 실제 작업에서 안정적으로 쓸 수 있는지는 확인이 필요합니다.

따라서 선택할 때는 **Agent에게 일을 맡기는 순간부터 결과를 직접 확인하는 과정까지** 이어서 사용해 보는 것이 좋습니다. T3 Code의 가벼움과 작업 정리 방식이 잘 맞는지, Orca의 통합된 개발 환경이 필요한지 확인하면 자신의 작업 방식에 맞는 쪽을 고르기 쉬워집니다.

---

_이 글은 사용 경험과 공식 자료를 바탕으로 AI의 도움을 받아 작성했습니다._
