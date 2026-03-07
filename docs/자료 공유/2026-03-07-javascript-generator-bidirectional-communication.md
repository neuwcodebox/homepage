# JavaScript Generator 심화: yield와 next로 구현되는 양방향 제어 흐름

JavaScript의 `generator`와 `async generator`는 단순히 값을 순차적으로 생성하는 iterator 이상의 기능을 가진다.  
핵심은 **함수 실행을 외부에서 제어할 수 있다는 것**이며, `yield`와 `next()`를 통해 **양방향 통신**이 가능하다는 점이다.

이 글에서는 다음 내용을 정리한다.

- generator의 실행 모델
    
- `yield` 표현식과 `next(value)`의 관계
    
- `throw`와 `return`이 generator 흐름을 바꾸는 방식
    
- `yield*` 위임 시 예외 전달 구조
    
- 실무에서 generator가 활용되는 패턴
    

---

# Generator의 본질: 실행 가능한 상태 머신

generator 함수는 일반 함수와 다르게 **실행이 중단되고 재개될 수 있다.**

```js
function* gen() {
  console.log("A");
  yield 1;
  console.log("B");
  yield 2;
  console.log("C");
}
```

실행 흐름은 다음과 같이 상태 머신처럼 동작한다.

```
STATE 0 → A 실행 → yield 1 → STATE 1
STATE 1 → B 실행 → yield 2 → STATE 2
STATE 2 → C 실행 → 종료
```

즉 generator는 **값을 생성하는 함수라기보다 외부에서 제어 가능한 실행 컨텍스트**라고 보는 것이 정확하다.

---

# yield는 값 반환이 아니라 실행 중단

`yield`는 `return`과 다르게 **함수를 종료하지 않는다.**

```js
function* gen() {
  yield 1
  yield 2
}
```

호출 측에서는 iterator 인터페이스를 통해 제어한다.

```js
const it = gen()

it.next() // { value: 1, done: false }
it.next() // { value: 2, done: false }
it.next() // { value: undefined, done: true }
```

`yield`는 **실행을 중단하고 제어권을 호출자에게 넘기는 지점**이다.

---

# yield는 표현식이다 (양방향 통신)

많이 알려져 있지 않지만 `yield`는 **표현식(expression)** 이다.

```js
function* gen() {
  const x = yield 1
  console.log(x)
}
```

호출 흐름:

```js
const it = gen()

it.next()      // yield 1
it.next(42)    // x = 42
```

동작 순서:

1. `yield 1` → 호출자에게 값 전달
    
2. generator 실행 중단
    
3. `next(value)` 호출 시
    
4. `yield` 표현식의 결과값이 `value`가 된다
    

즉 다음 구조가 된다.

```
yield value  ←→  next(input)
```

이 구조 덕분에 **핑퐁 형태의 양방향 통신이 가능**하다.

---

# generator의 세 가지 제어 명령

generator는 외부에서 세 가지 명령으로 제어할 수 있다.

|메서드|의미|
|---|---|
|next(value)|정상 진행|
|throw(error)|예외 주입|
|return(value)|즉시 종료|

이 세 가지가 generator 실행 흐름을 바꾸는 유일한 방법이다.

---

# return() 호출 시 흐름

```js
async function* gen() {
  try {
    yield 1
    yield 2
  } finally {
    console.log("cleanup")
  }
}
```

```js
const it = gen()

await it.next()
await it.return()
```

동작:

```
yield 1
→ return 호출
→ finally 실행
→ generator 종료
```

`return()`은 **남은 코드 실행을 건너뛰고 종료 경로로 진입한다.**

---

# throw() 호출 시 흐름

`throw()`는 **generator 내부에서 예외가 발생한 것처럼 동작**한다.

```js
async function* gen() {
  try {
    yield 1
  } finally {
    console.log("finally")
  }
}

const it = gen()

await it.next()

try {
  await it.throw(new Error("boom"))
} catch (e) {
  console.log("caught:", e.message)
}
```

출력 흐름

```
finally
caught: boom
```

즉

1. `yield` 위치에서 예외 발생
    
2. `finally` 실행
    
3. 예외가 호출자에게 전파
    

---

# for await...of와 자동 정리

`for await`는 iterator 종료 시 자동으로 `return()`을 호출한다.

```js
for await (const x of gen()) {
  break
}
```

동작:

```
break
→ iterator.return()
→ finally 실행
```

따라서 `for await`를 사용하면 **generator 정리가 자동으로 보장된다.**

---

# yield* : generator 위임

`yield*`는 다른 generator에 실행을 위임한다.

```js
function* inner() {
  yield 1
  yield 2
}

function* outer() {
  yield* inner()
}
```

이 경우

```
outer.next() → inner.next()
```

처럼 호출이 위임된다.

---

# yield* 상태에서 throw 호출

`yield*` 중일 때 `throw()`가 호출되면  
**현재 실행 중인 가장 안쪽 generator에 전달된다.**

예시:

```js
function* inner() {
  yield 1
}

function* outer() {
  yield* inner()
}

const it = outer()

it.next()

it.throw(new Error("boom"))
```

흐름:

```
outer.throw()
→ inner.throw()
→ inner yield 지점에서 예외 발생
→ 처리되지 않으면 outer로 전파
```

즉 예외는 **현재 위임된 generator의 `yield` 위치에서 발생한 것처럼 동작한다.**

---

# 실무에서 generator가 사용되는 패턴

generator는 다음 상황에서 특히 유용하다.

## 1. 상태 머신

프로토콜이나 단계 기반 로직을 구현할 때.

```js
function* login() {
  const user = yield "username"
  const pass = yield "password"
  return authenticate(user, pass)
}
```

---

## 2. Agent / Tool 실행 루프

LLM 에이전트 구조에서도 많이 사용된다.

```js
async function* agent() {
  const result = yield {
    type: "tool",
    name: "search"
  }

  yield {
    type: "final",
    answer: result
  }
}
```

외부 런타임이 tool을 실행하고 결과를 `next()`로 주입한다.

---

## 3. 인터랙티브 CLI

사용자 입력 기반 wizard 구현.

```js
function* wizard() {
  const name = yield "name?"
  const age = yield "age?"
  return { name, age }
}
```

---

# 핵심 정리

generator의 핵심 개념은 다음이다.

```
yield value
     ↕
next(input)
```

이를 통해 generator는

- 실행 중단
    
- 외부 제어
    
- 양방향 통신
    

을 동시에 지원한다.

결과적으로 generator는 **값을 생성하는 함수라기보다 외부에서 조종 가능한 실행 컨텍스트**라고 이해하는 것이 가장 정확하다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._