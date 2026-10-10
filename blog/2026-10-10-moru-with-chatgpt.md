# Sign in with ChatGPT 붙혀보기

최근에 [Sign in with ChatGPT](https://learn.chatgpt.com/docs/sign-in-with-chatgpt) 기능이 출시됐다. 사실 그 이전에도 비공식(이긴 한데 거의 공식인) 방법으로 개인 ChatGPT 계정을 붙혀서 LLM 호출하는 방법이 있긴 했지만 이제 공식적으로 나온거다. 다만 일부 미지원 기능이 있다. 이건 아마 차차 풀리지 않으려나... 아무튼 이걸 좀 써보고 싶어서 저번에 만들었던 [로컬 이미지 생성 툴](https://github.com/neuwcodebox/moru)에 붙혀봤다.

{/* truncate */}

![](blog/assets/2026-10-10-moru-with-chatgpt/file-20261010164640785.png)

뭐 별 거는 없고 공식 문서 기반으로 ChatGPT로 로그인할 수 있게 설정 지원하고, 기존에 로컬 LLM으로 이미지 프롬프트 생성하던 걸 ChatGPT로도 할 수 있게 한거다. 로컬 LLM 대비 장점이라면 당연히 자기 컴터 자원을 안 쓴다는 거랑 성능 좋은 모델을 쓸 수 있다는 거... 단점이라면 요청이 거부당할 수도 있다는 거. 근데 아직 거부되는 거 본 적은 없음.

![](blog/assets/2026-10-10-moru-with-chatgpt/file-20261010164551704.png)

그리고 하는 김에 [단보루 API](https://safebooru.donmai.us/wiki_pages/help:api)를 도구로 만들어서 붙혀놨다. ChatGPT 정도면 단보루 태그들은 이미 다 알고 있긴 할텐데 그래도 이렇게 붙히고 나니까 더 정확한 태그를 쓰는 느낌?

![](blog/assets/2026-10-10-moru-with-chatgpt/file-20261010164526572.png)

또 이거도 한 김에 ChatGPT가 아니고 로컬 LLM으로 할 때에도 단보루 검색 도구를 쓸 수 있게끔 해놨다. 다만 후달리는 로컬 LLM이니까 에이전틱하게는 못하고 이미지 프롬프트 생성 전에 단보루 검색 쿼리를 생성하게 해서 그걸로 검색 돌린 후 나온 결과를 참조해서 최종 생성에 쓰게 해놨음. Naive RAG 느낌? 나름 잘 된다.

음... moru 프로젝트는 저번을 끝으로 마무리했는데 또 신기한 기능 하나 찾은 김에 이것저것 해버렸다 ㅋㅋ...