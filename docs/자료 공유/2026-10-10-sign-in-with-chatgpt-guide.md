# Sign in with ChatGPT 공개! 이제 내 앱에서도 ChatGPT 구독을 사용할 수 있다

**ChatGPT 계정으로 로그인하고, 별도의 API 키 없이 사용자의 ChatGPT 구독으로 AI 기능까지 제공하는 방법**

_2026년 10월 10일 기준 · OpenAI 공식 문서 참고_

OpenAI가 최근 **Sign in with ChatGPT(SIWC)** 기능을 공개했습니다.

처음에는 구글이나 애플 로그인처럼 일부 제휴 서비스에만 제공되는 소셜 로그인 기능인 줄 알았는데, 공식 개발자 문서를 살펴보니 더 흥미로운 기능이 있었습니다.

바로 **개발자가 만든 오픈소스 앱에서도 사용자의 ChatGPT 구독을 이용해 AI 모델을 호출할 수 있다는 것**입니다.

기존에는 자신의 앱에 OpenAI 모델을 연동하려면 사용자가 API 키를 발급받거나, 개발자가 직접 API 사용 비용을 부담해야 했습니다.

이제는 지원되는 앱에서 사용자가 ChatGPT 계정으로 로그인하고 권한을 승인하면, 기존 Plus 또는 Pro 구독의 사용량을 활용할 수 있습니다.

어디까지 사용할 수 있고, 실제로 어떻게 구현하는지 공식 자료를 중심으로 정리해 봤습니다.

---

## 1. Sign in with ChatGPT란?

Sign in with ChatGPT는 ChatGPT 계정을 외부 애플리케이션에 연결하는 인증 기능입니다.

크게 두 가지로 나뉩니다.

### ① Identity — ChatGPT 계정으로 로그인

일반적인 소셜 로그인과 비슷합니다.

사용자가 `Continue with ChatGPT` 버튼을 누르면 OpenAI 인증 페이지에서 로그인하고, 승인한 계정 정보를 앱에 전달합니다.

앱은 이를 활용해 사용자를 식별하거나 회원가입·로그인 기능을 제공할 수 있습니다.

제공되는 정보는 승인된 권한에 따라 사용자 식별자, 이름, 이메일, 프로필 사진 등입니다.

### ② ChatGPT Plan Usage — ChatGPT 구독으로 AI 호출

개발자 입장에서 더 흥미로운 부분입니다.

사용자가 별도로 권한을 승인하면, 앱이 해당 사용자의 ChatGPT 구독 사용량을 이용해 OpenAI의 Responses API를 호출할 수 있습니다.

예를 들어 오픈소스 AI 데스크톱 앱에서 다음과 같은 흐름이 가능해집니다.

1. 사용자가 앱을 설치합니다.
    
2. `Continue with ChatGPT` 버튼을 누릅니다.
    
3. ChatGPT에 로그인하고 구독 사용 권한을 승인합니다.
    
4. 앱에서 AI 모델을 선택하고 사용합니다.
    

별도의 API 키 발급이나 API 결제 설정 없이도 사용할 수 있는 것입니다.

물론 무제한으로 호출할 수 있다는 뜻은 아닙니다. **앱의 요청은 사용자가 기존에 보유한 ChatGPT 구독의 사용량 한도를 소비합니다.**

또한 로그인과 구독 사용은 별개의 권한입니다. ChatGPT 계정으로 로그인했다고 해서 구독 사용 권한까지 자동으로 부여되는 것은 아닙니다.

**참고:** 이 기능을 사용해도 앱이 사용자의 기존 ChatGPT 대화 기록이나 메모리에 접근할 수 있는 것은 아닙니다.

[공식 문서: Sign in with ChatGPT Quickstart](https://developers.openai.com/siwc/quickstart)

---

## 2. 아무 개발자나 사용할 수 있을까?

현재는 프로젝트의 유형에 따라 공개 범위가 다릅니다.

|프로젝트 유형|지원 여부|
|---|---|
|오픈소스 데스크톱 앱|지원|
|오픈소스 CLI 및 코딩 에이전트|지원|
|로컬에서 실행하는 개인 프로젝트|지원|
|사용자가 직접 관리하는 원격 VM|별도 절차로 지원|
|일부 승인된 비공개 앱|지원|
|일반 상용 웹사이트의 소셜 로그인|제한적 시범 운영|
|유료 앱 및 클라우드 호스팅 서비스|별도 승인 필요|

즉, **오픈소스 프로젝트의 구독 연동 기능은 일반 개발자도 사용할 수 있지만, 상용 웹사이트의 로그인 기능까지 전면 개방된 것은 아닙니다.**

오픈소스 연동은 별도의 파트너 API 키나 OAuth Client Secret 없이 시작할 수 있도록 설계됐습니다.

반면 일반 상용 웹사이트에서 ChatGPT 소셜 로그인을 제공하려면 OpenAI에서 OAuth Client ID를 발급받아야 하며, 현재는 선정된 파트너를 대상으로 제한적으로 운영되고 있습니다.

공식적으로 구독 연동을 안내하는 오픈소스 개발 문서는 ChatGPT Plus와 Pro 사용자를 대상으로 합니다. 일부 제휴 상용 서비스는 Go 요금제도 지원하지만, 이를 모든 오픈소스 앱에 그대로 적용할 수 있다고 보기는 어렵습니다.

[공식 문서: Open-source ChatGPT Plan Usage](https://developers.openai.com/siwc/token-sharing-open-source)

---

## 3. 기존 OpenAI API와 무엇이 다를까?

가장 큰 차이는 인증 방식과 비용 부담 구조입니다.

|구분|일반 OpenAI API|Sign in with ChatGPT 구독 연동|
|---|---|---|
|인증|API Key|OAuth Access Token|
|과금|API 사용량에 따른 별도 과금|사용자 ChatGPT 구독 사용량|
|모델 접근|API 프로젝트 권한에 따름|연결된 ChatGPT 계정 권한에 따름|
|모델 목록|API 모델 카탈로그|사용자별 사용 가능 모델 조회|
|사용량 제한|API Rate Limit 등|ChatGPT 구독 및 앱별 한도|
|주요 용도|서버·상용 서비스 등|사용자 중심 오픈소스 앱 등|

기존 API가 사라지거나 대체되는 것은 아닙니다.

개발자 자신의 서버에서 여러 사용자의 요청을 처리하는 SaaS라면 일반 API가 더 적합할 수 있습니다.

반면 사용자의 컴퓨터에서 실행되는 CLI, 데스크톱 유틸리티, 코딩 에이전트 등은 Sign in with ChatGPT가 좋은 선택지가 될 수 있습니다.

특히 사용자가 자신의 API 키를 복사해서 앱 설정에 붙여넣어야 했던 과정이 사라진다는 점에서 사용자 경험이 크게 개선됩니다.

### 지원 기능에도 차이가 있다

구독 연동 방식은 일반 Responses API의 모든 기능을 제공하지 않습니다.

2026년 10월 기준 주요 지원 범위는 다음과 같습니다.

|기능|구독 연동 지원|
|---|---|
|텍스트 생성 및 추론|지원|
|코드 생성|지원|
|이미지 입력·분석|모델에 따라 지원|
|파일을 요청에 직접 입력|모델에 따라 지원|
|Function Calling / Custom Tools|지원|
|Web Search|모델·계정 정책에 따라 지원|
|이미지 생성|미지원|
|File Search|미지원|
|Code Interpreter|미지원|
|OpenAI 호스팅 MCP·커넥터|미지원|
|네이티브 Computer Use|미지원|
|오디오·비디오 입력|미지원|

특히 **파일을 입력으로 전달하는 기능과 File Search 도구는 서로 다릅니다.**

PDF 등의 파일 내용을 모델에 입력하는 것은 지원될 수 있지만, OpenAI의 Vector Store에 문서를 업로드하고 File Search를 호출하는 방식은 현재 지원되지 않습니다.

또한 Function Calling으로 앱 자체의 검색 기능이나 로컬 도구를 연결할 수 있지만, 이것이 OpenAI의 모든 호스팅 도구를 사용할 수 있다는 의미는 아닙니다.

[공식 문서: Preview Limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations)

---

## 4. 실제 연동 구조 살펴보기

오픈소스 앱의 로그인에는 **OAuth 2.0 Authorization Code Flow + PKCE + OpenID Connect**가 사용됩니다.

기본적인 인증 절차는 다른 OAuth 로그인과 비슷하지만, 한 가지 특징이 있습니다.

최초 로그인 시 OpenAI가 클라이언트를 동적으로 등록한다는 것입니다.

일반적인 OAuth 연동처럼 개발자가 사전에 Client ID와 Client Secret을 발급받아 둘 필요가 없습니다.

### Step 1. 앱 설치 환경의 Host ID 생성

먼저 앱이 실행되는 환경을 식별하기 위한 `ext_agent_host_id`를 생성합니다.

간단하게는 UUID를 사용할 수 있습니다.

```
urn:uuid:550e8400-e29b-41d4-a716-446655440000
```

이 값은 앱 설치 환경별로 생성하고 로컬에 보관합니다.

앱을 재시작하거나 다른 ChatGPT 계정으로 전환해도 동일한 설치 환경에서는 기존 Host ID를 재사용합니다.

### Step 2. 브라우저에서 OAuth 로그인

앱은 시스템 브라우저를 열어 다음 OpenAI 인증 엔드포인트로 사용자를 이동시킵니다.

```
GET https://auth.openai.com/api/accounts/authorize
```

최초 인증 시 사용되는 주요 파라미터입니다.

|파라미터|설명|
|---|---|
|`client_id`|최초에는 `dynamic_agent_client`|
|`agent_name_hint`|실제 앱 이름|
|`ext_agent_host_id`|앞서 생성한 Host ID|
|`response_type`|`code`|
|`redirect_uri`|로컬 콜백 주소|
|`scope`|요청할 권한|
|`resource`|`https://api.openai.com/v1`|
|`state`|CSRF 방지를 위한 랜덤 값|
|`nonce`|ID Token 검증용 랜덤 값|
|`code_challenge_method`|`S256`|
|`code_challenge`|PKCE Challenge|

구독 사용까지 요청할 경우 Scope는 다음과 같습니다.

```
openid profile email offline_access resource.invoke chatgpt.tokens.use.direct
```

여기서 `chatgpt.tokens.use.direct`가 구독 기반 AI 호출에 필요한 핵심 권한입니다.

로컬 데스크톱 앱에서는 다음과 같은 Loopback 주소를 콜백으로 사용할 수 있습니다.

```
http://127.0.0.1:1455/auth/callback
```

공식 오픈소스 연동 규격에서는 초기 등록부터 `127.0.0.1`을 사용해야 합니다. `localhost`로 임의 변경하면 안 되며, 재인증 시에도 경로는 유지하고 포트만 변경할 수 있습니다.

### Step 3. Authorization Code로 토큰 발급

사용자가 승인을 마치면 앱의 콜백으로 Authorization Code와 최초 등록 시 발급된 Client ID가 전달됩니다.

그다음 토큰 엔드포인트에 요청합니다.

```
POST https://auth.openai.com/api/accounts/oauth/token
Content-Type: application/x-www-form-urlencoded
```

요청에 포함할 주요 값은 다음과 같습니다.

```
grant_type=authorization_code
client_id=<ISSUED_CLIENT_ID>
code=<AUTHORIZATION_CODE>
code_verifier=<PKCE_VERIFIER>
redirect_uri=<SAME_REDIRECT_URI>
resource=https://api.openai.com/v1
```

성공하면 Access Token, Refresh Token, ID Token, 승인된 Scope 등이 반환됩니다.

앱은 ID Token의 서명과 발급자, 대상, 만료 시간, nonce 등을 검증한 뒤 사용자 정보를 저장합니다.

또한 실제 승인된 Scope에 `chatgpt.tokens.use.direct`가 포함돼 있는지 확인해야 합니다.

인증에 사용한 `dynamic_agent_client`는 최초 등록용 값일 뿐입니다. 이후 로그인과 토큰 교환에는 발급받은 실제 Client ID를 사용해야 합니다.

### Step 4. 토큰 보관 및 갱신

공식 문서에 명시된 토큰 유효기간은 다음과 같습니다.

- Access Token: 1시간
    
- Refresh Token: 30일
    

Refresh Token을 사용해 갱신하면 새로운 Access Token과 Refresh Token이 발급됩니다.

갱신 시 Refresh Token도 교체되므로 새 값을 안전하게 저장해야 하고, 동일한 토큰으로 갱신 요청을 병렬 실행하지 않도록 주의해야 합니다.

인증 토큰은 암호화된 로컬 저장소에 보관하는 것이 권장되며, 웹 UI나 로그에 노출해서는 안 됩니다.

[공식 문서: Registration and Sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)

---

## 5. 로그인 후 AI 모델 호출하기

OAuth 인증이 완료되면 일반 OpenAI API와 같은 Responses API 엔드포인트로 요청을 보낼 수 있습니다.

다만 API Key 대신 발급된 OAuth Access Token을 사용합니다.

### 사용 가능한 모델 조회

먼저 로그인한 계정의 모델 목록을 조회합니다.

```
curl --fail-with-body \
  https://api.openai.com/v1/models \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  | jq '[.models[] |
      select(.visibility == "list") |
      {slug, display_name}]'
```

`display_name`은 사용자에게 보여줄 이름이고, `slug`는 실제 API 호출에 사용할 모델 식별자입니다.

사용자나 연결된 계정에 따라 사용 가능한 모델이 달라질 수 있으므로 모델 이름을 고정하기보다는 이 목록을 기반으로 선택하도록 구현하는 것이 좋습니다.

### Responses API 호출

다음은 발급받은 Access Token으로 AI 모델을 호출하는 예시입니다.

```
curl --no-buffer \
  https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-6.1-sol",
    "input": [
      {
        "role": "user",
        "content": "안녕하세요! 자기소개를 해주세요."
      }
    ],
    "store": false,
    "stream": true
  }'
```

여기서 `gpt-6.1-sol`은 공식 문서에 나온 예시 모델입니다. 실제 호출에는 앞서 조회한 계정별 지원 모델을 사용해야 합니다.

주의할 점은 일반 Responses API와 다르게 다음 옵션이 필수라는 것입니다.

```
{
  "store": false,
  "stream": true
}
```

요청 결과는 스트리밍으로 전달됩니다.

텍스트가 일부 출력되더라도 `response.completed` 이벤트를 받아야 최종 성공으로 판단할 수 있습니다. 스트리밍 도중 `response.failed`가 반환될 수도 있습니다.

또한 현재 이 경로에서는 `temperature`, `top_p`, `max_output_tokens`, `background`, `conversation` 등의 일부 파라미터를 사용할 수 없습니다.

HTTP 요청에서 `previous_response_id`를 이용한 대화 이어가기 역시 지원되지 않으므로 필요한 이전 대화 내용을 `input`에 직접 포함해야 합니다.

[공식 문서: Models and Inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference)

---

## 6. 공식 SDK를 이용하면 훨씬 간단하다

지금까지 OAuth 과정을 살펴봤지만, 실제 프로젝트에서 이 과정을 전부 직접 구현해야 하는 것은 아닙니다.

OpenAI가 **Sign in with ChatGPT DevKit**을 GitHub에 공개했습니다.

**GitHub:** [https://github.com/openai/sign-in-with-chatgpt-devkit](https://github.com/openai/sign-in-with-chatgpt-devkit)

주요 구성은 다음과 같습니다.

|구성|용도|
|---|---|
|`@siwc/local`|OAuth 인증, 계정 관리, 토큰 저장·갱신, 모델 조회, Responses 호출|
|`@siwc/react`|로그인 UI, 계정 연결 상태, 구독 사용 관리|
|`examples/paste-perfect`|실제 동작하는 데스크톱 앱 예제|
|`assets`|로그인 버튼 및 브랜드 관련 에셋|

현재 `@siwc/local`과 `@siwc/react`는 공식 저장소의 로컬 워크스페이스 패키지이므로 일반 npm 패키지처럼 게시됐다고 가정해서는 안 됩니다.

### 공식 예제 실행해 보기

OpenAI는 _Paste Perfect_라는 데스크톱 앱을 예제로 제공합니다.

텍스트를 복사한 뒤 ChatGPT를 이용해 내용을 변환하고, 그 결과를 다른 앱에 붙여넣는 프로그램입니다.

현재 공식 예제는 macOS 14 이상을 요구하며 Node.js 22.12 이상과 Xcode Command Line Tools가 필요합니다.

```
git clone https://github.com/openai/sign-in-with-chatgpt-devkit.git

cd sign-in-with-chatgpt-devkit

npm ci
npm run build
npm start
```

실행 후 ChatGPT 계정을 연결하고 구독 사용을 승인하면 예제 앱의 AI 기능을 시험할 수 있습니다.

이 예제에서 참고할 만한 부분은 UI보다도 구조입니다.

Electron 메인 프로세스에서 OAuth 인증, 토큰 저장, 모델 호출을 처리하고 React UI는 브리지를 통해 필요한 기능만 호출합니다.

즉, 프런트엔드에 Access Token을 직접 노출하지 않고 인증과 AI 기능을 분리합니다.

Node.js 기반 로컬 앱이나 Electron 앱이라면 가장 먼저 살펴볼 만한 예제입니다.

**주의:** 공식 DevKit은 MIT나 Apache 같은 일반적인 오픈소스 라이선스가 아닙니다. 이 부분은 뒤에서 다시 설명하겠습니다.

[공식 Cookbook: Integrating Sign in with ChatGPT in your Open Source App](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt)

---

## 7. 사용량과 비용은 어떻게 관리될까?

Sign in with ChatGPT를 사용한다고 해서 앱마다 새로운 무료 API 사용량이 생기는 것은 아닙니다.

기존 ChatGPT 구독에 포함된 작업 사용량을 외부 앱과 공유하는 방식입니다.

ChatGPT Plus와 Pro 등 지원되는 구독 요금제의 사용량 제한이 그대로 적용되며, 여러 앱을 연결하더라도 한도는 독립적으로 늘어나지 않습니다.

사용자는 ChatGPT 설정의 `Settings → Usage`에서 연결된 앱의 사용량을 확인할 수 있습니다.

또한 `App limits`에서 앱별 주간 사용량 한도를 설정할 수 있습니다.

예를 들어 특정 앱의 한도를 전체 주간 사용량의 20%로 지정하면, 해당 앱이 전체 사용량을 과도하게 소비하지 않도록 제한할 수 있습니다.

이 비율은 별도로 예약된 사용량이 아니라 사용 가능한 전체 한도에 대한 상한선입니다.

사용자가 앱과의 연결을 해제하려면 ChatGPT의 `Settings → Security and login → Sign in with ChatGPT`에서 연결을 관리할 수 있습니다.

### 사용량 초과 시 처리

사용량 제한에 도달하면 다음과 같은 오류가 발생할 수 있습니다.

```
subscription_sharing_usage_limit_exceeded
```

이때 개발자는 오류를 사용자에게 알리고 ChatGPT 사용량 설정으로 안내하는 것이 좋습니다.

일시적인 사용량 조회 장애에는 다음 코드가 사용됩니다.

```
subscription_sharing_usage_unavailable
```

권한이나 계정 조건이 충족되지 않으면 다음 오류가 발생할 수 있습니다.

```
subscription_sharing_user_not_eligible
```

이런 오류는 무작정 로그인이나 API 요청을 반복한다고 해결되는 것이 아닙니다. 오류 원인에 맞춰 사용량 확인, 권한 재승인, 다른 인증 방식 선택 등을 제공해야 합니다.

특히 사용량 한도에 도달했다고 해서 개발자의 API 키로 자동 전환되지는 않습니다.

[공식 문서: Errors and Recovery](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery)

---

## 8. 배포 전에 반드시 확인할 약관과 라이선스

기능 자체는 매력적이지만 실제 앱을 배포하려면 몇 가지 중요한 제한을 확인해야 합니다.

### ① 사용자의 구독을 범용 API 프록시로 제공할 수 없다

사용자의 ChatGPT 구독으로 다른 사람의 요청을 대신 처리하거나, 연결된 앱과 무관한 요청을 전달하는 범용 API 프록시를 제공하는 것은 허용되지 않습니다.

요청은 로그인한 사용자 자신의 활동 또는 명시적으로 승인한 자동화에서 발생해야 합니다.

즉, 사용자의 구독을 모아 여러 사람에게 API 서비스로 제공하는 구조는 적합하지 않습니다.

### ② 구독 사용 기능에 추가 결제를 강제할 수 없다

SIWC 약관은 사용자가 자신의 ChatGPT 구독을 연결해 사용하는 기능에 대해 개발자에게 비용을 지불하거나 유료 버전으로 업그레이드하도록 강제해서는 안 된다고 규정합니다.

다른 독립적인 유료 기능을 제공하는 문제와 SIWC 구독 연동 접근권을 유료화하는 문제는 구분해야 합니다.

유료 애플리케이션이나 상업적 서비스라면 별도 승인 여부도 확인해야 합니다.

### ③ 사용자의 토큰을 중앙 서버에 모아서는 안 된다

인증 토큰의 지속 저장은 사용자가 제어하는 로컬 환경에 제한됩니다.

사용자가 직접 관리하는 원격 실행 환경에 관한 별도 가이드도 있지만, 그렇다고 개발자가 운영하는 공용 서버에 여러 사용자의 Refresh Token을 수집해도 된다는 뜻은 아닙니다.

사용자별 토큰 저장 위치와 실행 환경을 명확하게 설계해야 합니다.

### ④ 공식 DevKit의 라이선스는 비상업적이다

개인적으로 가장 주의해서 볼 부분입니다.

공식 GitHub 저장소의 OpenAI 작성 코드와 문서에는 다음 라이선스가 적용됩니다.

**Sign-in with ChatGPT DevKit Noncommercial License v1.0**

개인 학습, 실험 및 비상업적 개발 등을 허용하지만, 회사의 업무나 상업적 이익과 관련된 개발·운영은 비상업적 이용으로 보지 않습니다.

단순히 무료 소프트웨어로 배포한다고 해서 자동으로 비상업적 이용이 되는 것도 아닙니다.

상업적으로 공식 DevKit 코드를 이용하려면 별도의 서면 계약이 필요합니다.

다만 독립적으로 작성한 코드가 공식 SDK의 인터페이스를 호출했다는 이유만으로 곧바로 DevKit의 수정 저작물이 되는 것은 아니라는 규정도 있습니다. SDK 코드 자체의 라이선스와 SIWC 서비스의 이용약관은 각각 별도로 검토해야 합니다.

[SIWC 공식 이용약관](https://openai.com/ko-KR/policies/sign-in-with-chatgpt-terms/)

[공식 DevKit 라이선스](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/main/LICENSE)

---

## 9. 어떤 프로젝트에 활용할 수 있을까?

현재 지원 범위를 고려하면 사용자의 로컬 환경에서 실행되는 AI 도구가 가장 적합합니다.

**코딩 에이전트**

로컬 프로젝트를 분석하거나 코드를 수정하는 CLI 에이전트에서 사용자의 ChatGPT 구독을 활용할 수 있습니다. OpenAI는 Codex app-server와 연동하는 공식 문서도 제공합니다.

**AI 데스크톱 유틸리티**

텍스트 요약, 번역, 문서 작성 보조, 프롬프트 생성 등의 기능을 제공하는 데스크톱 앱에 적합합니다.

기존에는 사용자가 별도로 API 키를 설정해야 했다면, 이제 로그인 버튼 하나로 연결할 수 있습니다.

**로컬 자료 검색·분석 도구**

앱 자체에 검색 기능을 구현해 Function Calling으로 연결하는 방식도 가능합니다.

현재 File Search나 OpenAI 호스팅 MCP를 직접 사용하는 것은 지원되지 않지만, 앱에서 자체 검색을 수행하고 결과를 모델에 전달할 수 있습니다.

**개인용 자동화 도구**

사용자가 명시적으로 허용한 백그라운드 작업에도 활용할 수 있습니다.

다만 사용자 동의, 실행 환경 통제, 사용량 제한 등의 조건을 충족해야 합니다.

---

## 10. 정리하며

이번 Sign in with ChatGPT 공개는 단순히 로그인 수단이 하나 늘어난 것 이상의 의미가 있다고 생각합니다.

그동안 개인 개발자가 AI 앱을 공개할 때 고민해야 했던 부분 중 하나가 바로 API 비용과 인증이었습니다.

개발자가 API 비용을 부담하면 운영 비용이 발생하고, 사용자에게 API 키를 요구하면 사용 진입장벽이 높아집니다.

Sign in with ChatGPT는 지원되는 오픈소스 앱에 한해 이 문제를 상당 부분 해결할 수 있는 새로운 방법을 제공합니다.

물론 아직은 초기 단계입니다. 모든 Responses API 기능을 사용할 수 있는 것도 아니고, 상용 서비스에는 별도의 승인과 라이선스 검토가 필요합니다.

그럼에도 **사용자가 이미 보유한 ChatGPT 구독을 자신이 원하는 오픈소스 앱에 연결해 사용할 수 있다는 점**은 상당히 반가운 변화입니다.

앞으로 오픈소스 AI 도구들이 이 기능을 얼마나 적극적으로 활용할지 기대됩니다.

---

## 공식 참고 자료

이번 글은 2026년 10월 10일 기준 OpenAI 공식 문서를 바탕으로 작성했습니다. 기능과 정책은 변경될 수 있으므로 실제 구현 시 최신 문서를 확인하는 것이 좋습니다.

1. [Sign in with ChatGPT — Quickstart](https://developers.openai.com/siwc/quickstart) — 전체 기능과 공개 범위
    
2. [Integrating Sign in with ChatGPT in your Open Source App](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt) — 오픈소스 연동 튜토리얼
    
3. [Registration and Sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in) — OAuth 인증 구현
    
4. [Models and Inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference) — AI 호출 방법
    
5. [Preview Limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations) — 지원 기능 및 제한
    
6. [Sign in with ChatGPT DevKit](https://github.com/openai/sign-in-with-chatgpt-devkit) — 공식 SDK와 예제
    
7. [Sign in with ChatGPT Terms](https://openai.com/ko-KR/policies/sign-in-with-chatgpt-terms/) — 이용약관

---

*이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다.*
