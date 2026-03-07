# AI Agent Skills: 개념, 사양, 그리고 구현 방법

최근 **Claude Code, Codex, OpenClaw 등 고도화된 AI Agent 서비스**에서 공통적으로 등장하는 개념이 **Skills**이다.  
Skill은 Agent가 수행할 수 있는 **고수준 작업 능력을 패키지 형태로 정의한 것**이다.

이 글에서는 Agent Skills의 **기본 개념, 구조, 사양, 그리고 일반적인 구현 방식**을 정리한다.

---

# 1. Agent Skills란 무엇인가

Skill은 **특정 작업을 수행하기 위한 지식과 절차의 묶음**이다.

일반적으로 다음 요소를 포함한다.

- 작업 설명
    
- 수행 절차
    
- 필요한 도구
    
- 코드 또는 스크립트
    
- 참고 리소스
    

즉 Tool이 **단일 기능 호출**이라면 Skill은 **문제 해결 방법을 포함한 작업 단위**이다.

|구분|Tool|Skill|
|---|---|---|
|단위|함수 / API|작업 패키지|
|목적|단일 기능 수행|문제 해결 전략|
|구성|입력 / 출력|설명, 절차, 코드, 리소스|
|재사용성|낮음|높음|

예:

```
Tool
└ search_web(query)

Skill
└ research_topic
   ├ SKILL.md
   ├ scripts/
   └ resources/
```

---

# 2. Skills가 등장한 이유

Agent 시스템이 커질수록 다음 문제가 발생한다.

### 1. 프롬프트 비대화

Agent의 모든 로직을 프롬프트에 넣으면 컨텍스트가 계속 커진다.

```
system prompt
+ instructions
+ workflows
+ examples
+ tool descriptions
```

### 2. 작업 로직 재사용 문제

특정 작업 절차가 코드나 프롬프트 내부에 고정되면 재사용하기 어렵다.

### 3. 기능 확장 비용 증가

새 기능을 추가할 때

- 코드 수정
    
- 프롬프트 수정
    
- Tool 추가
    

가 동시에 필요해진다.

Skills는 **작업 로직을 외부 패키지로 분리하여 관리**하기 위한 구조이다.

---

# 3. Skill의 기본 구조

많은 Agent 시스템에서 **디렉토리 기반 Skill 구조**를 사용한다.

예:

```
skills/
  web_research/
    SKILL.md
    scripts/
      search.py
    resources/
      prompt.txt
```

핵심 파일은 **SKILL.md**이다.

예:

```markdown
---
name: web_research
description: Research a topic using multiple web sources
tools:
  - search_web
  - fetch_page
tags:
  - research
  - web
---

# Web Research Skill

This skill performs research using multiple web sources.

Steps

1. Search the topic
2. Read multiple sources
3. Summarize findings
```

메타데이터에는 보통 다음 정보가 포함된다.

```
name
description
tools
tags
version
```

본문에는

- 작업 절차
    
- 전략
    
- 예시
    

가 들어간다.

---

# 4. Agent가 Skill을 사용하는 방식

Skill 사용 방식은 크게 두 가지가 있다.

## 1. Agent가 자동 선택

Agent는 Skill 메타데이터를 보고 **필요한 Skill을 스스로 선택**한다.

과정

```
1. Agent 시작
2. Skill 목록 로딩
3. Skill metadata 제공
4. Agent가 Skill 선택
5. Skill 로딩
6. Skill 실행
```

이 방식은 Tool calling과 유사하다.

---

## 2. 사용자가 직접 선택

일부 시스템에서는 사용자가 Skill을 직접 선택할 수 있다.

예:

```
/research AI agents
```

이 경우 시스템이 해당 Skill을 활성화한다.

---

# 5. Skill 로딩 전략

Skill은 일반적으로 **Lazy Loading 방식**으로 사용된다.

## Startup Scan

Agent 시작 시 Skill 디렉토리를 스캔한다.

```
skills/
```

각 Skill의 `SKILL.md`에서 메타데이터를 읽는다.

예:

```
web_research
Research a topic using multiple web sources

summarize_document
Summarize long documents
```

이 정보만 Agent에게 제공한다.

---

## Lazy Loading

Skill 전체 내용은 처음부터 로딩하지 않는다.

Agent가 Skill을 사용하기로 결정하면 로딩한다.

```
Agent decides to use skill "web_research"
→ SKILL.md 본문 로딩
→ resources 로딩
```

이 방식의 장점

- 프롬프트 크기 감소
    
- 메모리 절약
    
- 확장성 증가
    

---

# 6. Skill 실행 방식

Skill 실행 방식은 시스템에 따라 다르지만 일반적으로 다음 세 가지가 있다.

## 1. Prompt Injection 방식

선택된 Skill의 내용을 프롬프트에 추가한다.

예:

```
You are using skill: web_research

Steps
1. Search
2. Read
3. Summarize
```

Agent는 이 지침을 따라 Tool을 호출한다.

---

## 2. 코드 실행 방식

Skill에 포함된 스크립트를 실행한다.

예:

```
skills/web_research/scripts/search.py
```

Agent 또는 런타임이 해당 코드를 실행한다.

---

## 3. Tool 기반 방식

Skill을 읽거나 실행하는 전용 Tool을 제공할 수 있다.

예:

```
activate_skill(name)
read_skill_resource(name, path)
```

예:

```
activate_skill("web_research")
```

이 Tool은 다음 파일을 읽는다.

```
skills/web_research/SKILL.md
```

---

# 7. 파일 시스템 접근 문제

모든 Agent 환경에서 **파일 시스템 접근이 가능한 것은 아니다.**

따라서 두 가지 접근 방식이 존재한다.

### 파일 접근 가능 환경

Agent 또는 런타임이 직접 Skill 파일을 읽는다.

```
open("skills/web_research/SKILL.md")
```

---

### 파일 접근 제한 환경

Skill 접근을 위한 Tool을 제공한다.

```
activate_skill
read_skill_resource
```

Tool이 Skill 파일을 읽어 Agent에게 전달한다.

---

# 8. Skill Runtime 구조

일반적인 Skill 시스템 구조는 다음과 같다.

```
Agent
  │
  ▼
Skill Registry
  │
  ├ scan skills directory
  ├ parse metadata
  └ provide skill list
  │
  ▼
Skill Loader
  │
  └ load skill when requested
  │
  ▼
Skill Runtime
```

구성 요소

### Skill Registry

- Skill 발견
    
- 메타데이터 관리
    

### Skill Loader

- Lazy loading
    

### Skill Runtime

- Skill 실행 관리
    

---

# 9. Skill 선택 방식

Agent가 Skill을 자동 선택하는 경우 일반적인 흐름은 다음과 같다.

```
User question
→ Agent reasoning
→ Skill 선택
→ Skill 실행
```

예:

```
User: Research the impact of AI on software development
```

Agent reasoning

```
This requires web research
→ use skill web_research
```

---

# 10. Skill 시스템 설계 원칙

Skill 시스템을 설계할 때 일반적으로 다음 원칙을 따른다.

### Agent 자율성

Skill 선택은 Agent가 수행한다.

---

### Lazy Loading

Skill은 필요할 때만 로딩한다.

---

### 파일 기반 구조

Skill은 코드가 아니라 **문서 중심 패키지**이다.

---

### 프롬프트 최소화

Skill 전체 내용을 항상 프롬프트에 포함하지 않는다.

---

### 확장성

새 Skill 추가는 디렉토리에 추가하는 방식으로 가능해야 한다.

```
skills/
```

---

# 11. 간단한 구현 예시

Skill Registry 예시

```python
from pathlib import Path
import yaml

def load_skills(path="skills"):
    skills = []

    for skill_dir in Path(path).iterdir():
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            continue

        content = skill_file.read_text()
        metadata = yaml.safe_load(content.split("---")[1])

        skills.append(metadata)

    return skills
```

Lazy Loader 예시

```python
def load_skill(name, path="skills"):
    skill_file = Path(path) / name / "SKILL.md"
    return skill_file.read_text()
```

---

# 12. Tool과 Skill의 관계

정리

```
Tools = API
Skills = knowledge + workflow
```

Agent 구조

```
Agent
 ├ tools
 ├ memory
 └ skills
```

Tools는 **행동**,  
Skills는 **전략**을 제공한다.

---

# 13. 정리

Agent Skills는 **Agent 시스템을 확장 가능하게 만드는 중요한 구조**이다.

핵심 특징

```
디렉토리 기반 패키지
메타데이터 기반 발견
Agent 자동 선택 또는 사용자 선택
Lazy loading
문서 중심 구조
```

이 구조를 사용하면

- Agent 기능 확장
    
- 프롬프트 크기 감소
    
- 작업 로직 재사용
    
- 시스템 모듈화
    

를 동시에 달성할 수 있다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._