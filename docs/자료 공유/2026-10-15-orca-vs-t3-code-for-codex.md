# Orca vs T3 Code, 직접 써보고 느낀 차이

여러 Coding Agent에게 작업을 맡기다 보면 대화창을 여러 개 여는 것만으로는 부족합니다. 작업별로 파일을 분리하고, Agent가 어디까지 진행했는지 확인하고, 끝난 결과를 검토할 수 있어야 합니다.

[Orca](https://github.com/stablyai/orca)와 [T3 Code](https://github.com/pingdotgg/t3code)는 이런 작업을 관리하는 도구입니다. 둘 다 Codex, Claude Code, OpenCode 등 여러 Agent를 지원하며, 저는 Windows + WSL 환경에서 Codex를 연결해 사용했습니다. [앞서 Orca와 Paseo를 비교한 글](./2026-08-18-orca-vs-paseo-for-codex.md)에 이어, 이번에는 T3 Code와의 차이를 정리했습니다.

T3 Code에서 먼저 느낀 차이는 가벼움과 깔끔한 Chat UI였습니다. 진행 중인 작업과 제가 확인할 작업을 구분하고, 끝난 대화를 정리하는 방식도 좋았습니다. 다만 작업 결과를 확인하는 화면이나 CLI 명령을 다루는 부분에는 아쉬움이 있었습니다.

| 비교 기준 | Orca | T3 Code |
| --- | --- | --- |
| 작업 구성 | Worktree 안에 Agent와 개발 도구를 함께 배치 | 프로젝트별 대화와 작업 상태 중심 |
| 병렬 작업 | Worktree로 작업 공간 분리 | 별도 branch·worktree 지원 |
| 결과 확인 | 에디터·diff·브라우저를 작업 공간에 함께 구성 | 우측 패널에서 파일과 diff 확인 |
| WSL | Windows 앱에서 연결 가능 | Windows 앱에서 연결 가능 |
| 사용감 | 여러 도구가 한곳에 모여 있지만 비교적 무거움 | 가벼운 느낌, 깔끔한 Chat UI와 Settle |

## 작업 공간을 관리하는 Orca, 대화를 정리하기 편한 T3 Code

Orca는 작업 하나에 필요한 개발 환경을 통째로 묶는 방식입니다. 저장소에서 [worktree](https://www.onorca.dev/docs/model/worktrees)를 만들고 그 안에 Agent, 에디터, 터미널과 브라우저를 배치합니다. 다른 작업으로 옮겨가면 그 작업의 파일과 도구를 함께 볼 수 있습니다.

T3 Code도 [프로젝트별 대화와 worktree](https://github.com/pingdotgg/t3code/blob/main/docs/user/thread-sidebar.md)를 지원합니다. 여러 Agent에게 서로 다른 작업을 맡기기 위한 기본 구성은 양쪽 모두 갖추고 있습니다. 다만 T3 Code를 사용하면서 특히 좋았던 것은 작업을 확인하고 정리하는 방식이었습니다.

진행 중인 작업은 아래에, 제가 확인하거나 대응해야 하는 작업은 위에 놓여 있어 보기 편했습니다. 결과를 확인한 대화는 Settle로 정리하고 다음 작업으로 넘어갈 수 있었습니다. Settle은 대화를 지우지 않고 활성 목록에서 치우는 기능이라, 기록을 남겨두면서 당장 볼 작업만 추리기에 좋습니다.

Chat UI도 깔끔합니다. T3 Code는 Codex의 app-server와 통신해 대화, 도구 실행과 승인 요청을 자체 화면으로 보여줍니다. 대화 내용이 정돈돼 있어 읽고 지시하기 편했고, 프로그램도 Orca보다 확실히 가볍게 느껴졌습니다. 성능을 수치로 측정한 것은 아니지만, 사용하면서 체감한 차이는 분명했습니다.

Orca에도 [구조화된 Chat UI](https://www.onorca.dev/docs/agents/native-chat)가 있고 Codex 연결에 app-server를 사용합니다. 다만 WSL·SSH 세션의 Chat UI는 터미널을 기반으로 동작한다고 안내합니다. 따라서 둘의 차이를 단순히 CLI와 app-server의 차이로 나누기보다는, 자신이 사용할 환경에서 채팅과 작업 관리가 얼마나 편한지를 보는 편이 좋습니다.

다만 CLI에서 쓰던 명령이 그대로 통하는 것은 아니었습니다. T3 Code에 `/goal`을 입력했지만 명령으로 인식되지 않았고, 일단 Codex가 뜻을 알아듣길 기대하며 사용했습니다. 개발 중인 [goal 연동](https://github.com/pingdotgg/t3code/blob/main/docs/internals/providers.md)이 실제 UI에 반영되면 이 부분은 나아질 여지가 있습니다.

## 결과를 확인하는 화면은 조금 아쉬웠습니다

Agent에게 작업을 맡기고 나면 어떤 파일이 바뀌었는지, 요청한 대로 수정했는지 간단히 확인하게 됩니다. 이때마다 IDE로 이동하지 않고 대화 옆에서 바로 볼 수 있으면 편합니다.

T3 Code는 파일 탐색뿐 아니라 diff도 우측 사이드 패널에서 확인합니다. 대화 화면 옆의 한정된 공간에서 파일과 변경 내용을 봐야 하니 좁게 느껴졌습니다. 기능이 빠져 있다기보다 결과를 확인하는 공간이 답답한 쪽에 가까웠습니다.

탭 구성도 이 불편을 더했습니다. 탐색기와 열어 둔 파일이 같은 탭 목록에 놓여 있어, 다른 파일을 찾으려면 탐색기 탭부터 다시 찾아야 했습니다. 탭을 선택하려다 가까이 있는 닫기 버튼을 잘못 누르기도 쉬웠습니다. 결국 파일을 더 살펴볼 때는 VS Code를 다시 열었습니다.

이런 간단한 확인은 Orca가 상대적으로 편했습니다. 파일 탐색기가 에디터 옆에 따로 남아 있어 다른 파일로 이동하기 쉬웠습니다. Agent가 한 일을 잠깐 살펴보고 다시 지시할 때는 이런 작은 차이가 편의성에 영향을 줍니다.

양쪽 모두 결과를 확인하고 다음 작업으로 이어가는 기능은 제공합니다. T3 Code는 [diff 확인과 commit·push·PR](https://github.com/pingdotgg/t3code/blob/main/docs/user/source-control.md)을 지원합니다. Orca에는 [diff의 특정 줄에 의견을 남겨 Agent에게 보내는 기능](https://www.onorca.dev/docs/review/annotate-ai-diff)이 있고, 내장 브라우저의 [Design Mode](https://www.onorca.dev/docs/browser/design-mode)로 화면 요소와 관련 정보를 전달할 수도 있습니다.

## 중요한 것은 Agent 작업을 관리하기 편한가입니다

T3 Code는 가볍게 대화하고 작업 상태를 정리하는 흐름이 좋았습니다. 우측 패널과 일부 명령 처리에는 아쉬움이 있지만, 여러 Agent의 작업을 관리하는 도구로서 장점은 분명했습니다.

Orca는 worktree마다 Agent와 터미널, 브라우저 같은 도구를 함께 두는 구성이 특징입니다. 작업에 필요한 도구를 한곳에 모아 쓰고 싶다면 살펴볼 만합니다. 다만 기능이 많다는 이유만으로 더 좋은 선택이 되는 것은 아닙니다. 실제로 쓰는 기능인지, 그만큼의 무게를 감수할 만한지가 중요합니다.

제가 사용하는 Windows + WSL 환경에서는 두 프로그램 모두 연결이 편했습니다. [Orca](https://www.onorca.dev/docs/agents/codex)와 [T3 Code](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md) 모두 WSL 환경을 지원하므로 기존 저장소와 개발 도구를 그대로 활용할 수 있습니다. 공식 문서상 [Orca의 원격 작업](https://www.onorca.dev/docs/ssh)·[모바일](https://www.onorca.dev/docs/mobile), [T3 Code의 원격 연결](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)도 지원합니다. 이 경우에는 Agent가 실행되는 호스트가 켜져 있고 연결 가능해야 합니다.

완성도도 함께 봐야 합니다. Orca는 Native Chat을 실험적 기능으로 안내하고, T3 Code도 아직 초기 프로젝트이며 버그가 있을 수 있다고 설명합니다. 필요한 기능이 있더라도 실제 작업에서 안정적으로 쓸 수 있는지는 확인이 필요합니다.

직접 써보니 T3 Code는 가벼움과 작업 정리 방식이 좋았고, 우측 패널처럼 자주 쓰는 화면은 더 다듬어졌으면 했습니다. Orca는 작업별로 여러 도구를 함께 두는 구성이 특징이지만 상대적으로 무겁게 느껴졌습니다. 평소 쓰는 IDE는 유지하면서, **Agent에게 일을 맡기고 진행 상황을 확인하고 결과를 정리하는 흐름**이 자신에게 맞는지 살펴보면 좋겠습니다.

---

_이 글은 사용 경험과 공식 자료를 바탕으로 AI의 도움을 받아 작성했습니다._
