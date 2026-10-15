# Orca 쓰다가 T3 Code도 써봤다

[앞서 Orca와 Paseo를 비교하면서](./2026-08-18-orca-vs-paseo-for-codex.md) 여러 Codex 작업을 한곳에서 관리하는 방법을 살펴봤습니다. 이번에는 [Orca](https://github.com/stablyai/orca)와 [T3 Code](https://github.com/pingdotgg/t3code)를 비교해 봤습니다.

사용 환경은 Windows와 WSL입니다. 두 프로그램을 쓰면서 가장 크게 느낀 차이는 모델의 답변 품질보다 **작업을 기다리고, 결과를 확인하고, 파일을 다시 찾아가는 과정**에 있었습니다.

T3 Code는 확실히 가볍게 느껴졌고 채팅 화면도 깔끔했습니다. 반면 파일을 여러 개 열어 확인할 때는 Orca의 구성이 더 편했습니다. T3 Code를 쓰다가 파일 탐색 때문에 VS Code를 다시 연 적도 있습니다.

이 글은 직접 느낀 사용 경험에 공식 문서와 공개 소스 조사를 더한 비교입니다. 자료 확인 기준은 **2026년 10월 15일**이며, 직접 사용한 앱의 정확한 버전은 이 글에서 특정하지 않았습니다. 따라서 당시 경험과 현재 문서에 나오는 기능을 구분했습니다. 속도에 대한 평가는 벤치마크가 아닌 체감입니다.

## 한눈에 비교

| 비교 기준 | Orca | T3 Code |
| --- | --- | --- |
| 중심에 있는 것 | Worktree에 Agent, 파일, 터미널, 브라우저를 묶은 개발 환경 | Agent와의 대화 및 작업 상태를 중심으로 구성한 작업 화면 |
| Codex 연결 | 터미널 실행과 Chat UI를 함께 제공. 환경에 따라 채팅 구현이 다름 | Codex app-server와 연동한 자체 Chat UI |
| 병렬 작업 | 저장소와 worktree 중심으로 작업 공간 관리 | 프로젝트와 thread를 관리하고 worktree로 작업 분리 |
| 파일 확인 | 별도 파일 탐색기와 에디터를 함께 사용 | 파일 탐색·편집 기능은 있지만 오른쪽 탭 동선이 아쉬웠음 |
| 작업 정리 | Worktree 단위 상태 확인과 정리 | Settle로 확인한 대화를 정리하는 흐름이 좋았음 |
| Windows + WSL | WSL의 Codex 사용 가능 | Windows 앱에서 WSL 연결 가능, 직접 연결하기도 편했음 |
| 체감 | 상대적으로 무겁게 느껴짐 | 더 가볍고 채팅 화면이 깔끔함 |

기능 설명은 아래 공식 자료를 기준으로 하고, 편의성과 체감 평가는 제 사용 경험입니다.

## 출발점이 다릅니다: 작업 공간과 대화

### Orca는 worktree가 하나의 작업 공간입니다

Orca에서는 저장소에서 worktree를 만들고, 그 안에 Agent와 에디터, 터미널, 브라우저를 배치합니다. 여러 기능이나 버그 수정을 병렬로 진행할 때 작업별 파일과 브랜치를 나누는 구조입니다. 공식 문서도 생성, 작업, diff 검토, commit·push·PR, 정리까지를 하나의 worktree 수명 주기로 설명합니다. [Orca worktree 문서](https://www.onorca.dev/docs/model/worktrees)

이 구성의 장점은 Agent가 답을 낸 뒤에도 이어집니다. 변경한 파일을 열어 보고, 코드를 조금 고치고, diff에 의견을 남긴 뒤 다시 Agent에게 수정하게 할 수 있습니다. Orca의 Annotate AI Diff는 줄 단위 의견을 모아 Agent에게 보내는 기능입니다. [Diff 검토 문서](https://www.onorca.dev/docs/review/annotate-ai-diff)

코드 편집에는 Monaco를 사용합니다. VS Code와 같은 에디터 엔진이지만, 이것이 VS Code의 확장과 개발 환경 전체를 그대로 제공한다는 뜻은 아닙니다. 별도 파일 탐색기와 자동 저장을 포함한 편집 흐름을 Orca 안에 갖춘 것으로 보는 편이 정확합니다. [에디터 문서](https://www.onorca.dev/docs/editing/monaco), [파일 탐색기 문서](https://www.onorca.dev/docs/editing/file-explorer)

프론트엔드에서는 내장 Chromium의 Design Mode도 차이를 만듭니다. 화면의 요소를 선택해 HTML, CSS와 스크린샷을 Agent에게 전달하는 방식입니다. 파일과 채팅뿐 아니라 실행 결과까지 같은 작업 공간에서 다루려는 방향이 보입니다. [Design Mode 문서](https://www.onorca.dev/docs/browser/design-mode)

### T3 Code는 대화를 진행하고 확인하는 흐름이 눈에 들어옵니다

T3 Code에서 마음에 든 것은 깔끔한 채팅 화면과 작업 정리 방식입니다. 여러 작업을 돌려 놓고 내가 봐야 할 대화부터 확인하는 흐름이 자연스러웠습니다.

특히 끝난 대화를 확인한 뒤 **Settle로 정리하는 방식**이 좋았습니다. 진행 중인 작업은 아래에 두고, 제가 확인하거나 대응해야 하는 작업은 위에서 보는 구성이 편했습니다. 단순히 대화를 많이 띄우는 것보다 지금 어디에 신경 써야 하는지가 잘 보였습니다.

왼쪽 사이드바 자체는 이제 Orca와 T3 Code 모두 익숙해졌습니다. 처음 보는 화면의 낯섦보다는, 실제 작업을 반복할 때 손이 얼마나 덜 가는지가 비교 기준이 됐습니다.

공식 문서에서 T3 Code는 프로젝트별 thread와 worktree를 이용한 병렬 작업, 변경 diff와 commit·push·PR 흐름도 다룹니다. 단순한 채팅 전용 앱은 아닙니다. v0.0.45 소스에도 파일 편집·저장 기능이 있고, 현재 main 문서에서는 이를 대화와 연결하는 작업 흐름을 설명합니다. [Thread 관리](https://github.com/pingdotgg/t3code/blob/42da166d131017335a1158d0b379dd68b8985796/docs/user/thread-sidebar.md), [소스 관리](https://github.com/pingdotgg/t3code/blob/42da166d131017335a1158d0b379dd68b8985796/docs/user/source-control.md), [배포판 파일 편집 소스](https://github.com/pingdotgg/t3code/blob/v0.0.45/apps/web/src/components/files/FilePreviewPanel.tsx)

## 채팅은 T3 Code가 좋았지만, 파일을 찾을 때는 달랐습니다

T3 Code의 오른쪽 패널은 아직 불편했습니다.

제가 사용한 화면에서는 탐색기 탭과 열어 둔 파일 탭이 같은 층위에 놓였습니다. 파일을 보고 다른 파일을 찾으려면, 먼저 여러 탭 사이에서 탐색기 탭을 다시 찾아야 했습니다. 탭을 선택하려다가 가까이 있는 닫기 버튼을 잘못 누르기도 쉬웠습니다.

흐름으로 적으면 이렇습니다.

```text
T3 Code에서 제가 겪은 동선
파일 확인 → 탐색기 탭 다시 찾기 → 다음 파일 열기

Orca에서 편했던 동선
파일 확인 → 옆에 남아 있는 탐색기에서 다음 파일 열기
```

Orca는 파일 탐색기가 별도 영역에 남아 있어서 파일을 오가기가 편했습니다. T3 Code에 탐색기나 편집 기능이 없다는 이야기가 아닙니다. **기능이 있는 것과, 그 기능을 반복해서 쓰기 편한 것은 다른 문제**였습니다.

이 차이는 Agent가 대답할 때보다 제가 직접 코드를 확인할 때 더 크게 느껴졌습니다. 채팅으로 지시하고 기다리는 동안에는 T3 Code가 좋았지만, 파일을 계속 찾아보는 단계에서는 VS Code를 다시 열게 됐습니다.

## T3 Code는 확실히 가볍게 느껴졌습니다

반응 속도와 화면의 부담감은 T3 Code 쪽이 더 좋았습니다. app-server와 연동해 대화와 작업 내용을 정돈해서 보여주는 Chat UI도 마음에 들었습니다.

다만 이를 “메모리를 몇 배 적게 쓴다”거나 “app-server라서 무조건 빠르다”는 결론으로 바꿀 수는 없습니다. 같은 조건으로 CPU, 메모리, 시작 시간을 측정하지 않았고, 켜 둔 작업과 패널에 따라서도 체감은 달라질 수 있습니다.

이전 Orca·Paseo 글에서는 Orca의 무거움과 당시 겪었던 불안정성을 이야기했습니다. 그 경험은 그대로지만, 이전에 겪은 문제를 최신 Orca에서도 모두 재현되는 문제라고 단정하지는 않겠습니다. Orca의 [v1.4.224 릴리스 노트](https://github.com/stablyai/orca/releases/tag/v1.4.224)에도 채팅·터미널·원격 연결과 성능 관련 개선이 계속 나오고 있습니다.

## CLI와 app-server의 차이는 어디까지일까

T3 Code의 Codex 연동은 터미널 화면을 그대로 옮겨 놓는 방식과 다릅니다. `codex app-server`와 통신하면서 대화, 도구 실행, 승인 요청 등을 자체 화면으로 표현합니다. CLI 설치가 불필요해지는 것이 아니라, 같은 Codex 실행 파일에 대화형 터미널 대신 app-server 프로토콜로 연결하는 방식입니다. 이 점이 제가 좋아한 깔끔한 채팅 경험과 연결됩니다. [T3 Code v0.0.45의 실행 인자](https://github.com/pingdotgg/t3code/blob/v0.0.45/apps/server/src/provider/Layers/codexLaunchArgs.ts#L12-L15)

그렇다고 현재 Orca를 단순히 “CLI를 띄우는 앱”으로만 분류하면 부정확합니다. Orca는 터미널 실행을 폭넓게 지원하면서 구조화된 Native Chat도 제공합니다. **공개 릴리스 v1.4.224의 Codex Native Chat 소스에도 app-server 연결이 들어 있습니다.** [Orca 릴리스 소스](https://github.com/stablyai/orca/blob/v1.4.224/src/main/codex/codex-structured-session-state.ts)

여기서 중요한 것은 실행 환경입니다. Orca의 현재 공식 문서는 지원되는 로컬 환경과 연결된 Orca Server의 구조화 채팅을 설명하는 한편, WSL·SSH 세션은 terminal-backed Chat UI를 사용한다고 구분합니다. Chat UI 자체도 Experimental로 안내합니다. Windows + WSL에서 느낀 경험을 모든 Orca 실행 방식에 그대로 적용하기 어려운 이유입니다. [Orca Chat UI 문서](https://www.onorca.dev/docs/agents/native-chat)

따라서 비교할 때는 “어느 쪽에 채팅 화면이 있나”뿐 아니라 **내 Agent가 어디에서 실행되고, 그 세션을 앱이 어떤 방식으로 다루는가**를 함께 봐야 합니다.

### `/goal`은 입력한 것과 활성화된 것을 구분해야 합니다

T3 Code에서 `/goal`을 입력했을 때는 명령으로 인식되지 않았습니다. 그래서 Codex가 의도를 알아들을 것이라고 생각하고 그대로 입력했습니다. 이때 Codex의 실제 goal 기능이 활성화됐는지까지 확인한 것은 아닙니다.

자료를 조사하니 버전 구분이 중요했습니다. 확인 시점의 최신 stable 릴리스는 [v0.0.45](https://github.com/pingdotgg/t3code/releases/tag/v0.0.45)이고, 이후 main 브랜치의 새 Codex adapter에는 `thread/goal/set`을 호출해 목표를 설정하는 코드가 있습니다. 단순히 goal 상태를 읽어 표시하는 코드만 있는 것은 아닙니다. [T3 Code main의 goal 설정 구현](https://github.com/pingdotgg/t3code/blob/42da166d131017335a1158d0b379dd68b8985796/apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts#L6332-L6420)

하지만 main에 구현이 있다는 사실이 제가 사용한 설치본에서 `/goal` 명령이 작동했다는 뜻은 아닙니다. 자연어로 “목표를 달성할 때까지 해 달라”고 요청하는 것과, 클라이언트가 Codex의 goal API를 호출해 상태를 관리하는 것은 구분해야 합니다.

Orca도 v1.4.224 소스에 goal 설정·일시 정지·재개에 쓰이는 API 호출이 있습니다. 다만 이 역시 구조화 채팅 경로의 구현이며, 제 WSL 사용 경험에서 직접 검증한 결과로 제시하는 것은 아닙니다. [Orca goal 설정 구현](https://github.com/stablyai/orca/blob/v1.4.224/src/main/codex/codex-structured-thread-goal.ts)

## WSL과 원격 사용은 둘 다 살펴볼 만합니다

Windows + WSL에서는 T3 Code도 연결이 편했습니다. 이전에 Paseo와 비교했을 때의 연결 번거로움을 T3 Code에도 그대로 적용할 이유는 없었습니다.

공식 자료에서도 Orca는 WSL 배포판의 Codex 실행을 지원하고, T3 Code는 Windows 앱에서 WSL을 연결하는 방식을 안내합니다. T3의 현재 설치 문서는 WSL 안에 provider CLI를 준비하고 앱이 서버 런타임을 마련하는 흐름을 설명합니다. Windows 쪽 설치 여부뿐 아니라 **실제로 작업할 WSL 안에 Codex와 개발 도구가 준비돼 있는지**를 확인해야 합니다. [Orca의 WSL Codex](https://www.onorca.dev/docs/agents/codex#codex-on-windows-wsl), [T3 Code 설치·WSL 문서](https://github.com/pingdotgg/t3code/blob/42da166d131017335a1158d0b379dd68b8985796/docs/user/install.md)

원격·모바일도 한쪽만의 기능으로 보기는 어렵습니다. Orca는 SSH worktree와 Remote Orca Server, iOS·Android companion을 안내합니다. T3 Code의 현재 공식 문서도 원격 서버에 desktop·web·mobile 클라이언트가 연결하는 구성을 설명합니다. 둘 다 휴대폰에서 별도의 개발 환경이 저절로 생기는 것으로 이해하면 안 됩니다. Agent와 파일이 있는 호스트가 실행 중이고 접근 가능해야 합니다. [Orca 원격 작업](https://www.onorca.dev/docs/ssh), [Orca 모바일](https://www.onorca.dev/docs/mobile), [T3 Code 원격 연결](https://github.com/pingdotgg/t3code/blob/42da166d131017335a1158d0b379dd68b8985796/docs/user/remote-access.md)

이 부분은 직접 장시간 써 본 비교가 아니라 자료로 확인한 범위입니다. 원격과 모바일이 선택의 핵심이라면 설치하려는 릴리스에서 필요한 기능과 연결 방식을 다시 확인하는 편이 좋습니다.

## 그래서 어느 쪽이 더 잘 맞을까

제 경험에서는 **T3 Code의 채팅과 작업 정리는 편했고, Orca의 파일 탐색과 작업 공간 구성은 편했습니다.** 어느 한쪽이 모든 면에서 더 낫다고 정리하기는 어렵습니다.

Orca를 먼저 살펴볼 만한 경우는 다음과 같습니다.

- 여러 worktree와 Agent를 관리하면서 코드도 자주 직접 확인하고 편집할 때
- 파일 탐색기, diff 검토, 터미널을 한 작업 공간에서 오가고 싶을 때
- 내장 브라우저와 Design Mode까지 개발 흐름에 넣고 싶을 때

T3 Code를 먼저 살펴볼 만한 경우는 다음과 같습니다.

- Codex와의 깔끔한 대화 화면과 여러 작업의 상태 확인이 중요할 때
- 끝난 대화를 확인하고 정리하는 Settle 흐름이 잘 맞을 때
- 필요하면 VS Code를 함께 열어 파일 탐색과 편집을 이어 가도 괜찮을 때

완성도 역시 기능 목록만으로 판단하기는 어렵습니다. Orca는 Native Chat을 Experimental로 안내하고, T3 Code도 [현재 README](https://github.com/pingdotgg/t3code/blob/42da166d131017335a1158d0b379dd68b8985796/README.md)에서 초기 프로젝트이며 버그가 있을 수 있다고 밝힙니다. “더 가볍다”는 제 체감이 곧 모든 환경에서 더 안정적이라는 의미는 아닙니다.

결국 제가 두 도구에서 다르게 느낀 것은 **Agent에게 일을 맡기는 편의성과, 그 결과를 사람이 확인하는 편의성**이었습니다. 여러 대화를 돌릴 때는 T3 Code가 좋았고, 파일을 계속 오가며 확인할 때는 Orca의 구성이 좋았습니다. 기존 IDE까지 완전히 대체할지 판단하려면 두 과정 모두 자기 작업 방식에 맞는지 살펴봐야 합니다.

---

### 자료 확인 기준

- 조사일: 2026년 10월 15일
- 공개 stable 릴리스 확인: Orca [v1.4.224](https://github.com/stablyai/orca/releases/tag/v1.4.224), T3 Code [v0.0.45](https://github.com/pingdotgg/t3code/releases/tag/v0.0.45)
- Orca의 웹 문서는 확인 시점의 내용이며, 릴리스 구현을 인용한 부분은 v1.4.224 소스에 연결했습니다
- T3 Code의 현재 문서와 개발 중 구현은 main의 [42da166](https://github.com/pingdotgg/t3code/tree/42da166d131017335a1158d0b379dd68b8985796)에 고정했습니다. main의 모든 기능이 stable 배포판에 포함됐다는 의미는 아닙니다
- 직접 사용한 버전은 특정하지 않았으며, 최신 배포판 전체를 다시 실측한 리뷰는 아닙니다

_이 글은 사용 경험과 공식 자료를 바탕으로 AI의 도움을 받아 작성했습니다._
