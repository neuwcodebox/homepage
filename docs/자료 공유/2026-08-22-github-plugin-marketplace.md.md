# GitHub 저장소 하나로 Codex·Claude Code 플러그인 마켓플레이스 배포하기

Agent Skill을 GitHub에 공개했다면 사용자가 저장소를 clone하고 파일을 직접 복사하게 할 필요는 없다.

Codex와 Claude Code는 GitHub 저장소를 **사용자 정의 플러그인 마켓플레이스**로 등록하는 방식을 지원한다. 필요한 manifest를 저장소에 추가하면 다음처럼 설치할 수 있다.

```bash
# Codex
codex plugin marketplace add OWNER/REPO
codex plugin add my-skill@my-skill

# Claude Code
claude plugin marketplace add OWNER/REPO
claude plugin install my-skill@my-skill
```

## Skill과 Plugin은 다르다

Agent Skill의 실제 구현은 보통 다음과 같다.

```text
skills/
└── my-skill/
    ├── SKILL.md
    ├── scripts/
    ├── references/
    └── assets/
```

`SKILL.md`가 실제 작업 지침을 담는다.

Plugin은 Skill과 관련 리소스를 설치 가능한 단위로 묶는 계층이다. Codex와 Claude Code는 각각 자체 plugin metadata를 사용하지만 `skills/my-skill/`은 공통으로 사용할 수 있다.

따라서 같은 Skill을 플랫폼별로 복사할 필요는 없다.

## 단일 플러그인 저장소의 구조

저장소 하나가 플러그인 하나를 배포한다면 다음 정도면 충분하다.

```text
my-skill/
├── .agents/
│   └── plugins/
│       └── marketplace.json
├── .codex-plugin/
│   └── plugin.json
├── .claude-plugin/
│   ├── marketplace.json
│   └── plugin.json
├── skills/
│   └── my-skill/
│       └── SKILL.md
├── README.md
└── LICENSE
```

핵심은 **저장소 루트 자체를 플러그인 루트로 사용하는 것**이다.

```text
GitHub repository
├── Codex marketplace metadata
├── Claude Code marketplace metadata
├── Codex plugin metadata
├── Claude Code plugin metadata
└── skills/
    └── my-skill/
```

단일 플러그인을 위해 다시 다음과 같은 계층을 만들 필요는 없다.

```text
plugins/
└── my-skill/
    └── skills/
        └── my-skill/
```

이런 구조는 하나의 marketplace 저장소에서 여러 플러그인을 관리할 때 더 적합하다.

## Codex Plugin

Codex plugin manifest는 다음 위치에 둔다.

```text
.codex-plugin/plugin.json
```

Skill은 플러그인 루트의 `skills/`를 사용하도록 지정할 수 있다.

예를 들면 다음과 같다.

```json
{
  "name": "my-skill",
  "version": "0.1.0",
  "description": "Description of this plugin",
  "skills": "./skills/"
}
```

플랫폼용 manifest 안으로 `SKILL.md`를 복사하는 것이 아니라 기존 `skills/`를 그대로 참조한다.

## Codex Marketplace

Codex marketplace descriptor는 다음 위치에 둔다.

```text
.agents/plugins/marketplace.json
```

플러그인이 저장소 루트에 있다면 저장소 URL 자체를 plugin source로 지정할 수 있다.

개념적으로 다음과 같은 형태다.

```json
{
  "name": "my-skill",
  "interface": {
    "displayName": "My Skill"
  },
  "plugins": [
    {
      "name": "my-skill",
      "source": {
        "source": "url",
        "url": "https://github.com/OWNER/REPO.git",
        "ref": "main"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

사용자는 저장소를 marketplace로 등록한다.

```bash
codex plugin marketplace add OWNER/REPO
```

등록된 marketplace는 다음 명령으로 확인할 수 있다.

```bash
codex plugin marketplace list
```

이후 plugin을 설치한다.

```bash
codex plugin add my-skill@my-skill
```

`@` 앞은 plugin 이름이고 뒤는 marketplace 이름이다.

Marketplace 정보를 갱신하려면 다음 명령을 사용한다.

```bash
codex plugin marketplace upgrade
```

## Claude Code Plugin

Claude Code plugin metadata는 다음 위치에 둔다.

```text
.claude-plugin/plugin.json
```

예:

```json
{
  "name": "my-skill",
  "version": "0.1.0",
  "description": "Description of this plugin"
}
```

Claude Code는 플러그인 루트의 `skills/`를 기본 component 위치로 사용할 수 있으므로 실제 Skill은 그대로 유지할 수 있다.

```text
skills/
└── my-skill/
    └── SKILL.md
```

## Claude Code Marketplace

Claude Code marketplace descriptor는 다음 위치에 둔다.

```text
.claude-plugin/marketplace.json
```

저장소 자체가 plugin이라면 marketplace entry가 현재 root를 가리키게 할 수 있다.

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "my-skill",
  "owner": {
    "name": "OWNER"
  },
  "plugins": [
    {
      "name": "my-skill",
      "description": "Description of this plugin",
      "source": "./",
      "category": "productivity"
    }
  ]
}
```

여기서 중요한 부분은 다음이다.

```json
"source": "./"
```

Marketplace 저장소의 root 자체가 plugin이라는 뜻이다.

사용자는 GitHub 저장소를 marketplace로 등록한다.

```bash
claude plugin marketplace add OWNER/REPO
```

그리고 plugin을 설치한다.

```bash
claude plugin install my-skill@my-skill
```

Claude Code 안에서도 사용할 수 있다.

```text
/plugin marketplace add OWNER/REPO
/plugin install my-skill@my-skill
```

## Marketplace 이름과 Plugin 이름

다음 marketplace가 있다고 하자.

```json
{
  "name": "my-skill",
  "plugins": [
    {
      "name": "my-skill"
    }
  ]
}
```

설치 명령은 다음과 같다.

```text
my-skill@my-skill
│        │
│        └ marketplace
└ plugin
```

저장소 하나에서 plugin 하나만 배포한다면 두 이름을 같게 두는 것이 단순하다.

## Claude Code Marketplace 검증

Claude Code는 plugin과 marketplace 구조를 검사하는 명령을 제공한다.

```bash
claude plugin validate .
```

배포하기 전에 로컬 저장소 자체를 marketplace로 등록해 설치 과정을 확인할 수도 있다.

```bash
claude plugin marketplace add .
claude plugin install my-skill@my-skill
```

확인해야 할 것은 단순하다.

```text
marketplace 등록
→ plugin 검색
→ plugin 설치
→ Skill 발견
```

파일만 validator를 통과한다고 끝내지 말고 실제 설치까지 확인하는 것이 안전하다.

## 여러 Plugin을 한 Marketplace에서 관리한다면

하나의 저장소에서 여러 plugin을 배포하는 경우에는 `plugins/` 구조가 유용하다.

```text
marketplace/
├── .agents/
│   └── plugins/
│       └── marketplace.json
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    ├── plugin-a/
    ├── plugin-b/
    └── plugin-c/
```

Marketplace에서는 각 plugin의 하위 경로를 지정한다.

```json
{
  "name": "plugin-a",
  "source": "./plugins/plugin-a"
}
```

즉 구조 선택 기준은 다음과 같다.

|배포 방식|구조|
|---|---|
|저장소 하나 = plugin 하나|저장소 root를 plugin root로 사용|
|저장소 하나 = plugin 여러 개|`plugins/<name>/`으로 분리|

Plugin 하나짜리 저장소에서 `plugins/my-skill/skills/my-skill/`처럼 중첩할 이유는 없다.

## 최종 구조

단일 Agent Skill을 Codex와 Claude Code 양쪽에 배포한다면 다음 구조가 가장 단순하다.

```text
my-skill/
├── .agents/
│   └── plugins/
│       └── marketplace.json
├── .codex-plugin/
│   └── plugin.json
├── .claude-plugin/
│   ├── marketplace.json
│   └── plugin.json
└── skills/
    └── my-skill/
        └── SKILL.md
```

실제 Skill의 원본은 하나뿐이다.

```text
skills/my-skill/SKILL.md
```

나머지는 각 플랫폼이 이 저장소를 marketplace와 plugin으로 이해하기 위한 metadata다.

최종적으로 사용자는 다음 명령만 알면 된다.

```bash
# Codex
codex plugin marketplace add OWNER/REPO
codex plugin add my-skill@my-skill

# Claude Code
claude plugin marketplace add OWNER/REPO
claude plugin install my-skill@my-skill
```

GitHub 저장소를 그대로 배포 채널로 사용할 수 있어 별도 설치 스크립트나 수동 파일 복사를 안내하지 않아도 된다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._