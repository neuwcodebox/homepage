# Agent Plugins: AI 에이전트 확장 기능의 공통 패키지 표준

AI 에이전트 생태계가 발전하면서 **MCP(Model Context Protocol)**와 **Agent Skills**가 다양한 서비스에서 사용되고 있다.

MCP는 외부 도구와 데이터를 연결하고, Agent Skills는 특정 작업을 수행하기 위한 지침과 리소스를 제공한다.

하지만 이를 하나의 확장 기능으로 묶어 배포하는 방식은 서비스마다 달랐다. 같은 Skill과 MCP 서버를 사용하더라도 Claude Code, Codex, Cursor 등에 맞춰 별도의 플러그인 구조를 만들어야 하는 경우가 있었다.

이러한 문제를 해결하기 위해 등장한 표준이 **Agent Plugins**다.

2026년 8월 6일 공개된 Agent Plugins 1.0.0은 여러 AI 에이전트에서 재사용할 수 있는 공통 플러그인 패키지 형식을 정의한다.

- 공식 홈페이지: [https://agent-plugins.org](https://agent-plugins.org)
    
- GitHub: [https://github.com/agentplugins/agent-plugins-spec](https://github.com/agentplugins/agent-plugins-spec)
    

## 1. Agent Plugins란?

Agent Plugins는 AI 에이전트의 확장 기능을 **하나의 이식 가능한 패키지로 구성하기 위한 개방형 표준**이다.

핵심은 이미 존재하는 Agent Skills와 MCP를 새롭게 정의하는 것이 아니라, 이들을 일정한 구조로 묶는 것이다.

|구분|역할|
|---|---|
|MCP|AI 에이전트를 외부 도구 및 데이터와 연결|
|Agent Skills|특정 작업을 수행하는 지침과 리소스 제공|
|Agent Plugins|Skills와 MCP 서버를 하나의 확장 패키지로 구성|

예를 들어 GitHub 코드 리뷰를 수행하는 AI 에이전트를 생각해 보자.

- **MCP:** GitHub 저장소와 Pull Request에 접근하는 도구 제공
    
- **Skill:** 코드 리뷰 절차, 검토 기준, 보고서 작성 방법 제공
    
- **Plugin:** 두 구성 요소를 묶어 하나의 확장 기능으로 배포
    

기존에는 각 AI 에이전트가 자체 규격으로 이 구성 요소들을 관리했다.

Agent Plugins는 공통 디렉터리 구조와 메타데이터 형식을 정의함으로써 동일한 패키지를 여러 클라이언트에서 사용할 수 있도록 한다.

다만 표준을 지원하는 클라이언트라고 해서 모든 기능을 동일하게 제공하는 것은 아니다. 실제 지원 범위와 사용자 경험은 클라이언트에 따라 달라질 수 있다.

## 2. 누가 만들었을까?

Agent Plugins는 **Vercel이 최초로 제안**하고 여러 기업이 공동으로 발전시킨 표준이다.

초기 규격 개발에는 AWS, Anysphere(Cursor), GitHub, Microsoft, OpenAI, Vercel 등이 참여했다.

초기 기술 운영위원회(Technical Steering Committee)의 핵심 유지관리자는 다음 기업들에서 참여했다.

- Amazon
    
- Cursor
    
- Microsoft
    
- OpenAI
    
- Vercel
    

이 프로젝트는 특정 기업의 독점 규격이 아닌 벤더 중립적인 개방형 표준을 지향한다. 규격과 개발 과정은 GitHub에 공개되어 있다.

참고: [Vercel - Introducing Agent Plugins](https://vercel.com/blog/introducing-agent-plugins)

## 3. 플러그인 패키지 구조

Agent Plugins 1.0은 디렉터리를 기본 패키지 단위로 사용한다.

```
my-plugin/
├── plugin.json
├── skills/
│   └── summarize/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── mcp.json
└── com.example.client/
    └── hooks/
```

각 구성 요소의 역할은 다음과 같다.

|구성 요소|설명|필수 여부|
|---|---|---|
|`plugin.json`|플러그인 이름과 규격 버전 등 메타데이터|필수|
|`skills/`|Agent Skills 정의|선택|
|`mcp.json`|MCP 서버 연결 설정|선택|
|`com.example.client/`|특정 클라이언트 전용 확장 기능|선택|

필수 구성 요소는 `plugin.json`뿐이다. Skills만 포함하거나 MCP 서버만 포함하는 것도 가능하다.

### plugin.json

플러그인의 최상위 디렉터리에 위치하는 매니페스트 파일이다.

가장 단순한 형태는 다음과 같다.

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-plugin"
}
```

`$schema`는 플러그인이 따르는 Agent Plugins 규격 버전을 나타낸다.

`name`은 플러그인의 식별 이름이며, 소문자 영문·숫자·하이픈·마침표 등 정해진 문자 규칙을 따른다.

추가로 다음 메타데이터를 선언할 수 있다.

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Example agent plugin",
  "author": {
    "name": "Example Developer"
  },
  "license": "MIT",
  "keywords": ["example", "productivity"]
}
```

메타데이터 구조가 표준화되어 있어 클라이언트는 동일한 규칙으로 플러그인 정보를 해석할 수 있다.

### skills/

Agent Skills를 저장하는 디렉터리다.

각 Skill은 개별 하위 디렉터리에 위치하며 `SKILL.md`를 포함한다.

```
skills/
├── summarize/
│   └── SKILL.md
└── review/
    └── SKILL.md
```

`SKILL.md`의 기본 형태는 다음과 같다.

```
---
name: summarize
description: Summarize documents and technical reports.
---

# Document Summarization

1. Read the provided document.
2. Identify the main points.
3. Summarize the content clearly.
4. Preserve important technical details.
```

Skill 자체의 형식은 별도의 [Agent Skills 명세](https://agentskills.io/specification)를 따른다.

Agent Plugins는 Skill의 내용을 새롭게 정의하지 않고, 플러그인 내부에서 Skill을 어디에 배치하고 어떻게 발견할 것인지를 규정한다.

### mcp.json

플러그인이 사용할 MCP 서버를 선언하는 파일이다.

예를 들어 원격 MCP 서버를 연결하려면 다음과 같이 작성할 수 있다.

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "example-api": {
      "type": "streamable-http",
      "url": "https://example.com/mcp"
    }
  }
}
```

위 URL은 설정 형식을 보여주기 위한 예시다.

Agent Plugins 1.0에서 정의한 MCP 연결 방식은 세 가지다.

|방식|설명|
|---|---|
|`stdio`|로컬 프로세스와 표준 입출력을 통해 통신|
|`streamable-http`|HTTP 기반 원격 MCP 서버에 연결|
|`sse`|이전 MCP 규격의 HTTP+SSE 연결 방식|

로컬 MCP 서버를 실행하는 경우에는 `command`, `args`, `env`, `cwd` 등의 설정도 사용할 수 있다.

또한 `${PLUGIN_ROOT}`, `${PLUGIN_DATA}`라는 경로 변수를 지원한다.

- `PLUGIN_ROOT`: 플러그인이 설치된 디렉터리
    
- `PLUGIN_DATA`: 클라이언트가 관리하는 플러그인 전용 영속 데이터 디렉터리
    

이를 통해 플러그인 설치 위치와 실행 중 생성되는 데이터를 구분할 수 있다.

## 4. 간단한 Agent Plugin 만들어 보기

Skills 하나만 포함하는 최소 플러그인을 만들어 보자.

먼저 다음 디렉터리를 생성한다.

```
hello-plugin/
├── plugin.json
└── skills/
    └── greet/
        └── SKILL.md
```

`plugin.json`에는 다음 내용을 작성한다.

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "hello-plugin",
  "version": "1.0.0",
  "description": "A simple greeting plugin"
}
```

이어서 `skills/greet/SKILL.md`를 작성한다.

```
---
name: greet
description: Greet the user with a short friendly message.
---

# Greeting

When the user asks for a greeting,
respond with a short and friendly greeting.
```

이것으로 Agent Plugins 규격에 맞는 간단한 Skill 패키지가 완성된다.

표준을 지원하는 클라이언트는 다음 순서로 플러그인을 처리한다.

1. 플러그인 루트에서 `plugin.json`을 찾는다.
    
2. 매니페스트와 규격 버전을 검증한다.
    
3. `skills/` 디렉터리에서 Skill을 발견한다.
    
4. `SKILL.md`가 Agent Skills 규격에 맞는지 검증한다.
    
5. 유효한 Skill을 클라이언트에 등록한다.
    

MCP 서버를 추가하고 싶다면 같은 디렉터리에 `mcp.json`을 배치하면 된다.

단, **표준은 플러그인을 발견하고 로드하는 방식을 정의할 뿐, 사용자가 플러그인을 설치하거나 실행하는 명령까지 통일하지는 않는다.**

실제 설치 방법은 사용하는 클라이언트의 문서를 확인해야 한다.

## 5. 어떤 AI 에이전트가 지원할까?

2026년 11월 기준, 공식 홈페이지에 호환 클라이언트로 등록된 주요 제품은 다음과 같다.

|클라이언트|Agent Skills|MCP|
|---|---|---|
|Visual Studio Code|지원|지원|
|Cursor|지원|지원|
|GitHub Copilot|지원|지원|
|ChatGPT / Codex|지원|지원|
|Kiro|지원|지원|
|Hermes Agent|지원|지원|
|OpenClaw|지원|지원|

MCP의 세부 전송 방식 지원 여부는 제품에 따라 다르다.

또한 Agent Plugins는 점진적인 표준 도입을 허용한다. 클라이언트는 Skills 또는 MCP 중 하나만 구현해도 관련 적합성 요구사항을 충족할 수 있다.

따라서 **Agent Plugins 호환성을 지원한다는 사실만으로 모든 플러그인이 모든 환경에서 동일하게 작동한다고 보장할 수는 없다.**

최신 지원 현황은 [공식 호환 클라이언트 목록](https://agent-plugins.org/compatible-clients)에서 확인할 수 있다.

## 6. Claude Code 플러그인과의 차이

주목할 만한 점은 MCP와 Agent Skills를 처음 공개한 Anthropic의 Claude Code가 Agent Plugins의 공식 호환 클라이언트 목록에는 포함되어 있지 않다는 것이다.

Claude Code는 자체 플러그인 규격을 사용한다.

```
my-claude-plugin/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json
├── skills/
├── agents/
├── commands/
└── hooks/
```

Agent Plugins와 비교하면 다음과 같다.

|구성 요소|Agent Plugins 1.0|Claude Code Plugins|
|---|---|---|
|매니페스트|`plugin.json`|`.claude-plugin/plugin.json`|
|MCP 설정|`mcp.json`|`.mcp.json`|
|Skills|`skills/`|`skills/`|
|Agents|표준 범위 밖|`agents/`|
|Commands|표준 범위 밖|`commands/`|
|Hooks|클라이언트별 확장 영역|`hooks/`|

Claude Code는 Skills와 MCP를 지원하지만, 이들을 묶는 플러그인 규격은 별도로 유지하고 있다.

특히 Claude Code의 플러그인 구조에는 Hooks, Agents, Commands 등 Agent Plugins 1.0이 표준화하지 않은 구성 요소도 포함된다.

다만 Anthropic이 Agent Plugins 표준 제정에 참여하지 않은 구체적인 이유는 공개적으로 확인되지 않았다.

참고: [Anthropic - Claude Code Plugins](https://github.com/anthropics/claude-plugins-official)

## 7. 클라이언트 고유 기능은 어떻게 처리할까?

Agent Plugins는 클라이언트별 차이를 완전히 없애려는 규격이 아니다.

공통으로 사용할 수 있는 기능은 표준화하고, 클라이언트 고유 기능은 별도의 확장 영역에서 처리하도록 설계됐다.

이를 위해 역방향 도메인 이름(Reverse-Domain Name)을 사용하는 네임스페이스를 지원한다.

예를 들어 다음과 같이 특정 클라이언트 전용 설정을 추가할 수 있다.

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-plugin",
  "extensions": {
    "com.example.client": {
      "setting": true
    }
  }
}
```

동일한 이름의 디렉터리를 만들어 전용 파일을 배치하는 것도 가능하다.

```
my-plugin/
├── plugin.json
├── skills/
└── com.example.client/
    └── hooks/
```

여기서 `com.example.client`는 예시용 네임스페이스다.

해당 확장 영역을 이해하는 클라이언트는 고유 기능을 사용할 수 있고, 다른 클라이언트는 이를 무시한다.

이러한 구조는 공통 표준을 유지하면서도 개별 제품의 고유 기능을 발전시킬 수 있도록 한다.

## 8. 아직 표준화되지 않은 부분

Agent Plugins 1.0은 의도적으로 작은 범위만 규정한다.

표준화된 핵심 요소는 다음과 같다.

- 플러그인 매니페스트와 디렉터리 구조
    
- Agent Skills의 발견과 검증
    
- MCP 서버 설정과 연결 방식
    
- 클라이언트별 확장 네임스페이스
    
- 구성 요소별 오류 처리
    

반면 다음 영역은 공통 규격에 포함되지 않는다.

|영역|현재 상태|
|---|---|
|플러그인 설치와 배포|클라이언트별 구현|
|마켓플레이스 및 레지스트리|공통 규격 없음|
|권한 및 사용자 승인|클라이언트별 정책|
|패키지 서명과 출처 검증|공통 규격 없음|
|인증정보 및 비밀정보 관리|클라이언트별 구현|
|플러그인 간 의존성|공통 규격 없음|
|Hooks, Agents, Commands|1.0 표준 구성 요소가 아님|

특히 플러그인이 외부 명령을 실행하거나 민감한 데이터에 접근하는 경우에는 별도의 보안 정책이 필요하다.

Agent Plugins의 경로 검증 규칙이 플러그인 프로세스 전체를 샌드박싱하는 것은 아니다.

현재 공식 저장소에는 [1.1.0 작업 초안](https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.1.0.md)이 공개되어 있으며, Hooks 등 추가 구성 요소의 표준화도 논의되고 있다.

다만 제안 단계의 기능과 공식 발표된 규격은 구분해야 한다.

## 9. 정리

Agent Plugins는 AI 에이전트의 모든 기능을 통일하는 표준이 아니다.

**서로 다른 AI 에이전트가 동일한 확장 기능을 재사용할 수 있도록, 패키지의 공통 구조를 정의하는 표준**이다.

MCP가 외부 도구와의 연결을, Agent Skills가 작업 수행 방법을 표준화했다면, Agent Plugins는 이러한 구성 요소를 묶어 배포하는 단계를 표준화한다.

현재 1.0은 Skills와 MCP 서버라는 두 가지 구성 요소에 집중한다. 설치, 권한, 보안, 클라이언트 고유 기능 등은 여전히 각 제품의 책임이다.

그럼에도 ChatGPT, Codex, Cursor, GitHub Copilot, VS Code를 비롯한 여러 클라이언트가 공통 규격을 지원하기 시작했다는 점에서 의미가 있다.

AI 에이전트의 확장 기능을 개발하는 입장에서는 제품별 독자 규격에만 의존하지 않고, 재사용 가능한 공통 패키지를 구성할 수 있는 기반이 마련된 것이다.

### 참고 자료

- [Agent Plugins 공식 홈페이지](https://agent-plugins.org/)
    
- [Agent Plugins Specification 1.0.0](https://agent-plugins.org/specification)
    
- [Agent Plugins GitHub 저장소](https://github.com/agentplugins/agent-plugins-spec)
    
- [Vercel - Introducing Agent Plugins](https://vercel.com/blog/introducing-agent-plugins)
    
- [GitHub - Agent Plugins 1.0 발표](https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app/)
    
- [Agent Plugins - Future Considerations](https://github.com/agentplugins/agent-plugins-spec/blob/main/FUTURE_CONSIDERATIONS.md)
    

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._