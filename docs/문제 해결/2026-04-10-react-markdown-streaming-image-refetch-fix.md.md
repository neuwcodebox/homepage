# react-markdown 스트리밍 렌더링에서 커스텀 img가 반복 요청되던 문제 해결

LLM이 생성하는 Markdown을 `react-markdown`으로 실시간 렌더링할 때, 이미지 URL이 바뀌지 않는데도 같은 이미지 요청이 반복해서 발생할 수 있다.

이번 문제는 기본 `img` 렌더링에서는 발생하지 않았고, `components.img`를 커스텀했을 때만 발생했다.

## 문제 상황

스트리밍 중에는 토큰이 추가될 때마다 `content`가 바뀌고 컴포넌트가 다시 렌더링된다.

이 자체는 정상이다. 문제는 커스텀 `img` 렌더러가 매번 새로 생성되면, React와 `react-markdown` 입장에서 이전과 같은 타입이 아니라 새로운 렌더러로 취급될 수 있다는 점이다.

그 결과 이미지 노드가 업데이트가 아니라 재마운트에 가깝게 처리되고, 브라우저가 같은 `src`에 대해 네트워크 요청을 반복하게 된다.

## 원인

문제의 핵심은 `content` 변경 자체가 아니라 커스텀 `img` 렌더러의 identity가 렌더마다 바뀌는 것이었다.

예를 들어 아래와 같은 형태는 문제를 만들기 쉽다.

```tsx
function Message({ content }) {
  return (
    <ReactMarkdown
      components={{
        img(props) {
          return <img {...props} />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

위 코드는 `Message`가 다시 렌더링될 때마다 `components` 객체와 `img` 함수가 새로 만들어진다.

반면 기본 `img` 렌더링은 이런 불안정성이 없으므로 같은 문제가 발생하지 않았다.

## 해결 방법

전역으로 컴포넌트를 분리할 수 없는 구조였기 때문에, `components`를 `useMemo`로 고정했다.

```tsx
function Message({ content }) {
  const components = React.useMemo(
    () => ({
      img(props) {
        return <CustomImg {...props} />;
      },
    }),
    []
  );

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
}
```

이렇게 하면 `content`가 계속 바뀌어도 `components.img`의 identity는 유지된다.

즉, 스트리밍으로 인한 일반적인 리렌더링은 계속 일어나더라도, 커스텀 `img` 렌더러가 매번 새로운 타입처럼 바뀌지는 않는다.

## 왜 이 방법이 동작하는가

React에서는 리렌더링과 재마운트가 다르다.

- 리렌더링: 같은 타입의 요소를 다시 계산하고 업데이트
    
- 재마운트: 기존 것을 버리고 새로 생성
    

문제는 매 렌더마다 새로운 `img` 렌더러 함수를 만들면, 실제로는 같은 코드를 써도 이전과 다른 함수 객체가 된다는 점이다.

`useMemo`로 `components`를 고정하면, 스트리밍 중에도 같은 렌더러를 계속 사용하게 되어 이미지 노드가 불필요하게 교체되지 않는다.

## 정리

이번 문제의 원인은 다음과 같았다.

- `react-markdown`의 기본 `img`는 정상
    
- 커스텀 `img` 렌더러를 인라인으로 만들 때만 반복 요청 발생
    
- 원인은 스트리밍 중 커스텀 렌더러 identity 불안정
    
- `components`를 메모이제이션하여 해결
    

핵심은 다음 한 줄로 정리된다.

> 스트리밍 Markdown 렌더링에서 이미지 반복 요청이 발생하면, `src`보다 먼저 커스텀 렌더러의 identity 안정성을 확인해야 한다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._