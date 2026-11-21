# Jev: 텍스트를 생성하지 않는 System One 모델과 빠르게 커지는 오픈소스 생태계

2026년 9월 15일 TypeSafe AI가 **Jev**를 공개했다.

Jev는 GPT나 Claude처럼 문장을 생성하는 LLM과 목적이 다르다. TypeSafe는 Jev를 **System One Model**이라고 부른다. 자연어와 구조화된 데이터를 읽고, 미리 정의된 선택지에 대한 **확률이 포함된 판단**을 빠르게 반환하는 모델이다.

TypeSafe는 Jev를 위해 새로운 모델 아키텍처, 병렬 sampler, 그리고 **RLCD(Reinforcement Learning for Calibrated Decisions)**라는 학습 방법을 개발했다고 설명한다. 세부 아키텍처와 학습 데이터는 아직 공개하지 않았다.

## LLM에게 문장을 만들게 하지 않는다

일반적인 LLM으로 고객 문의를 분류한다고 해보자.

```text
입력
↓
LLM
↓
"이 문의는 billing 부서에서 처리해야 합니다."
↓
JSON 파싱 또는 Structured Output
↓
billing
```

결국 필요한 값은 `billing` 하나인데도 모델은 토큰을 순차적으로 생성해야 한다.

Jev는 처음부터 출력 공간을 제한한다.

```text
state
+
question
+
billing
technical
sales

↓ Jev

billing      0.91
technical    0.07
sales        0.02
```

출력은 문장이 아니라 **허용된 후보에 대한 확률분포**다.

그래서 존재하지 않는 부서명을 생성하거나 잘못된 JSON을 반환하는 문제도 구조적으로 막을 수 있다. 물론 `billing` 대신 `technical`을 선택하는 것처럼 **판단 자체가 틀릴 수는 있다.**

## Noul, Choice, Score

Jev가 제공하는 판단 형식은 크게 세 가지다.

### Noul

Yes/No에 해당하는 이진 판단이다.

```text
질문:
이 고객은 환불을 요청하고 있는가?

결과:
0.96
```

### Choice

여러 선택지 중 하나를 고른다.

```text
billing      0.82
technical    0.15
sales        0.03
```

최종 선택뿐 아니라 전체 확률분포도 얻을 수 있다.

### Score

정해진 단계 사이에서 어느 정도에 해당하는지 평가한다.

```text
낮음      0.05
보통      0.30
높음      0.55
심각      0.10
```

이를 이용해 심각도, 만족도, 위험도 같은 값을 표현할 수 있다.

현재 안정 버전은 `jev-1.13.0`이며 `jev-latest`가 이를 가리킨다. 공식 API 기준 전체 요청은 최대 64K token, `state + 가장 긴 question`에는 32K 제한이 있다. 가격은 input 100만 token당 $0.042이며 output token 요금은 없다.

## 여러 판단을 한 번에 요청할 수 있다

Jev의 중요한 특징 중 하나는 같은 상태에 대한 여러 질문을 한 요청에서 평가할 수 있다는 점이다.

```text
고객 문의
   │
   ├─ 어느 부서인가?
   ├─ 환불 요청인가?
   ├─ 화가 나 있는가?
   ├─ 긴급한가?
   └─ 사람이 처리해야 하는가?
```

TypeSafe는 이를 활용한 패턴을 **Speculative Fan-Out**으로 설명한다.

먼저 `category`를 판단하고 그 결과에 따라 다시 `severity`를 묻는 식으로 요청을 직렬화하지 않고, 앞으로 필요할 가능성이 있는 판단을 미리 요청한 뒤 코드에서 필요한 결과만 사용한다.

이 특성 때문에 Jev는 긴 응답을 만드는 모델보다 **소프트웨어 내부에서 반복적으로 호출되는 판단 모듈**에 잘 맞는다.

## 어디에 활용할 수 있을까

가장 단순한 용도는 분류와 라우팅이다.

```text
고객 문의
→ billing / technical / sales

Agent 요청
→ search / browser / coding / database

문서
→ relevant / irrelevant

사용자 입력
→ safe / review / block
```

하지만 활용 범위는 더 넓다.

### Agent의 Tool Router

Agent가 사용할 수 있는 도구가 여러 개라면 큰 LLM에게 매번 tool call을 생성하게 할 필요가 없다.

```text
사용자 요청
      ↓
     Jev
      ↓
search    0.03
browser   0.08
database  0.87
email     0.02
```

enum이나 boolean 형태의 argument도 함께 판단할 수 있다.

TypeSafe의 공식 function calling 예제는 10개 함수와 여러 인수를 **54개의 질문으로 만들어 하나의 요청에서 평가**한다.

### RAG Reranker

검색 엔진이나 vector DB가 후보 문서를 먼저 찾고 Jev가 의미적으로 다시 평가할 수 있다.

```text
BM25 / Vector Search
        ↓
후보 30개
        ↓
      Jev
        ↓
semantic relevance
        ↓
재정렬
```

TypeSafe가 공개한 CLERC 법률 문서 검색 예제에서는 40개 query 기준 BM25의 top-10 적중률이 38%였고, Jev reranking 후 62%로 증가했다.

### Guardrail과 검증

다음과 같은 작은 검증을 병렬로 수행할 수도 있다.

```text
prompt injection인가?
개인정보가 포함되어 있는가?
source가 claim을 뒷받침하는가?
정책을 위반하는가?
사람의 검토가 필요한가?
```

LLM-as-a-Judge를 여러 개의 작은 typed decision으로 분해하는 방식도 가능하다.

### Confidence Routing

확률을 그대로 프로그램의 제어 흐름에 사용할 수도 있다.

```text
confidence > 0.9
→ 자동 처리

0.6 ~ 0.9
→ 더 강한 모델 호출

< 0.6
→ 사람에게 전달
```

실제 서비스에서는 판단마다 위험도가 다르므로 서로 다른 threshold를 사용하는 것이 적절하다.

## Browser Agent에서도 활용되고 있다

대표적인 활용 사례가 `browser-use/jev-ultrafast`다.

일반 browser agent는 매 단계마다 LLM이 다음 행동을 생성한다.

```text
브라우저 상태
↓
LLM
↓
계획 및 JSON 생성
↓
click(...)
```

`jev-ultrafast`는 브라우저 runtime이 먼저 현재 가능한 행동을 만든다.

```text
CLICK
TYPE_TEXT
SELECT
SCROLL
WAIT
DONE
```

그리고 현재 클릭 가능한 element에도 번호를 붙인다.

```text
[1] Round trip
[2] Where from?
[3] Where to?
[4] Departure
```

Jev에는 다음 판단을 동시에 요청한다.

```text
어떤 동작인가?
어디를 클릭할 것인가?
어느 입력창인가?
어떤 선택지인가?
```

문자열 입력이 필요한 경우에만 별도의 생성 모델을 호출한다.

공개된 Google Flights 실험에서는 최적화된 구현이 동일 조건의 기존 구현 대비 median 실행 시간을 9.450초에서 7.092초로 줄였다. 다만 이는 한 종류의 작업을 세 번씩 비교한 작은 실험이며 일반적인 browser agent benchmark는 아니다.

이 사례에서 중요한 것은 7초라는 숫자보다 **Agent 문제를 생성 문제에서 선택 문제로 바꿨다는 점**이다.

## 공개 직후 빠르게 사용되기 시작했다

Vercel에 따르면 Jev는 AI Gateway에 추가된 후 24시간 안에 유료 팀의 약 13%에서 사용되었으며, 당시 AI Gateway에서 가장 빠르게 채택된 신규 모델이 됐다.

TypeSafe도 Python과 JavaScript SDK뿐 아니라 기존 LLM과 동일한 System One 인터페이스로 비교할 수 있는 `system-one-adapter-python`을 공개했다.

덕분에 같은 입력을 Jev와 GPT, Claude 같은 생성 모델에 넣고 비용, 속도, 판단 결과를 비교하기 쉬워졌다.

## 오픈소스 커뮤니티도 빠르게 따라붙고 있다

Jev의 내부 구조와 학습 데이터는 공개되지 않았다.

그러나 공개 직후부터 기존 오픈웨이트 모델로 동일한 종류의 모델을 구현하려는 프로젝트가 다수 등장했다.

현재는 단순한 실험 수준을 넘어 서로 다른 접근법이 경쟁하는 단계다.

|프로젝트|기반 모델|특징|
|---|---|---|
|**Kev**|Qwen3.5 0.8B / 4B / 9B|LoRA + pointer head, 체계적인 transfer/calibration 평가|
|**Decider**|Qwen3.5 0.8B / 2B / 35B-A3B|LM logits 기반 decision model, System One API 호환, outcome RL|
|**Laya**|ModernBERT / mmBERT|322~421M encoder 기반 초경량 모델|
|**Nimble**|Qwen3.5-9B|소규모 contrastive dataset으로 decision fine-tuning|
|**Open-Jev 계열**|Qwen, DiffusionGemma 등|다양한 아키텍처 실험|

### Kev

Kev는 현재 가장 체계적으로 개발되는 Jev 계열 오픈모델 중 하나다.

Qwen3.5-0.8B, 4B, 9B를 기반으로 LoRA와 작은 pointer head를 학습한다.

```text
Qwen representation
       ↓
question
       ↓
pointer head
       ↓
candidate probabilities
```

공식 TypeSafe SDK가 로컬 Kev 서버를 사용할 수 있도록 System One API도 호환한다.

Kev-9B의 개발용 new-source benchmark accuracy는 0.822, Jev는 같은 개발 항목에서 0.857이었다. Kev 저자는 Jev의 학습 데이터를 알 수 없기 때문에 이를 통제된 architecture 비교로 해석해서는 안 된다고 명시한다.

흥미로운 것은 calibration이다. Kev-9B는 temperature scaling 후 new-source ECE가 0.106에서 0.042로 감소했다.

### Decider

Decider는 Qwen3.5를 이용하지만 별도의 일반적인 classifier head 대신 **Qwen의 기존 LM head에서 선택지에 대응하는 token logit만 읽어 사용한다.**

```text
Qwen
 ↓
answer-slot hidden state
 ↓
A / B / C token logits
 ↓
softmax
```

초기 버전은 일반적인 supervised cross-entropy 학습이 중심이었지만 v10에는 browser task와 game outcome을 이용한 calibration-aware reinforcement learning 단계도 추가됐다.

Decider가 공개한 동일 조건 실험에서는 MiniWoB++ sampled browser task 성공률이 v8의 83.0%에서 v10의 93.2%로 증가했다. 반면 일반적인 validation accuracy와 다른 공개 benchmark에는 거의 변화가 없었다.

이는 일반적인 의미 판단 학습과 실제 행동 결과를 이용한 policy 학습이 서로 다른 역할을 할 수 있음을 보여준다.

### Laya

Laya는 접근법이 완전히 다르다.

Qwen 같은 decoder LLM 대신:

```text
ModernBERT-large 421M
mmBERT-base      322M
```

같은 bidirectional encoder를 사용한다.

문장을 생성할 필요가 없는 문제라면 굳이 autoregressive decoder를 사용할 이유가 없다는 접근이다.

T4 기준 프로젝트가 공개한 측정에서는 한 질문을 약 33ms에 처리한다. 멀티링구얼 모델은 100개 이상의 언어를 대상으로 설계됐다.

다만 기본 Laya checkpoint 자체의 범용 decision 능력은 높지 않다. 프로젝트의 typed-decisions benchmark에서 base Laya는 0.362였고, 해당 작업으로 fine-tune한 `laya-typed-decisions`가 0.766을 기록했다.

즉 Jev처럼 강한 범용 zero-shot 모델보다는 **작고 빠른 모델을 특정 업무에 fine-tune해 사용하는 접근**에 가깝다.

한국어가 포함된 MASSIVE 20-way intent 실험에서는 multilingual checkpoint가 0.450을 기록해 영어 전용 checkpoint의 0.110보다 높았다.

### Nimble

Bespoke Labs의 Nimble은 Qwen3.5-9B에 LoRA를 적용했다.

특징은 모델 구조보다 **데이터 구성 방법을 공개하는 것**에 가깝다.

Jev 결과를 distillation하지 않고 2,676개의 curated contrastive training examples를 사용해 decision model을 학습하는 recipe를 공개했다.

## 결국 핵심은 데이터일 가능성이 크다

Jev 공개 직후에는 새로운 모델 아키텍처 자체가 가장 중요한 기술일 것이라는 추측이 많았다.

하지만 불과 일주일 만에 여러 프로젝트가 기존 Qwen이나 BERT 계열 모델만으로도 상당한 decision 능력을 만들었다.

공통 구조는 대체로 다음과 같다.

```text
강한 pretrained representation
            +
범용 decision training data
            +
candidate scoring
            +
probability calibration
            ↓
      System One Model
```

Kev, Decider, Nimble 모두 기존 foundation model을 decision 형태의 데이터로 다시 학습하는 방식으로 높은 성능을 얻고 있다.

Laya는 더 나아가 작은 encoder 모델도 특정 domain에서는 충분히 사용할 수 있음을 보여준다.

반대로 Jev는 현재 공개된 비교에서 **범용 zero-shot 판단, 많은 선택지, calibration, 서로 다른 작업으로의 전이**에서 여전히 강한 모습을 보인다.

TypeSafe가 구체적인 모델 구조보다 학습 데이터와 RLCD 세부 내용을 공개하지 않고 있는 이유도 이 부분과 관련될 가능성이 있지만, 현재 공개 자료만으로 확인할 수는 없다.

## LLM을 대체하는 모델은 아니다

Jev를 GPT나 Claude의 경쟁 모델로 이해하면 용도를 잘못 잡기 쉽다.

Jev는 글을 쓰지 못하고, 자유로운 답변을 생성하지 않으며, 복잡한 추론이 필요한 문제에도 적합하지 않다.

대신 시스템을 다음처럼 구성할 수 있다.

```text
입력
 │
 ▼
Jev / Kev / Laya
 │
 ├─ 확실한 판단
 │      ↓
 │     코드 실행
 │
 ├─ 애매한 판단
 │      ↓
 │   큰 LLM 호출
 │
 └─ 고위험 판단
        ↓
       사람
```

정확한 계산은 코드가 하고, 짧은 의미 판단은 System One 모델이 하고, 복잡한 추론과 생성은 LLM이 담당한다.

Jev의 의미는 더 빠른 챗봇을 만든 것이 아니라 **지금까지 LLM에게 맡겼던 수많은 작은 의미 판단을 별도의 모델 계층으로 분리했다는 데 있다.**

현재 Jev 주변에서 가장 흥미로운 변화도 모델 하나의 성능 경쟁보다 이 지점에서 일어나고 있다.

Agent의 tool routing, RAG reranking, browser automation, guardrail, LLM-as-a-Judge, confidence routing처럼 기존에는 전부 생성형 LLM에게 맡기던 기능들이 점차 **확률을 반환하는 작은 decision problem**으로 다시 정의되고 있다.

Jev가 장기적으로 중요한 모델이 될지는 아직 알 수 없다. 하지만 **모든 AI 작업을 token generation으로 해결할 필요는 없다**는 문제 제기는 이미 여러 오픈소스 프로젝트를 통해 빠르게 실험되고 있다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._