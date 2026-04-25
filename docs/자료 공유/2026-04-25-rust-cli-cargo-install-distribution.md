# Rust CLI 툴을 `cargo install`로 설치 가능하게 배포하기

Rust로 CLI 툴을 만들었다면 사용자가 다음 명령으로 설치할 수 있게 배포할 수 있다.

```bash
cargo install my-cli
```

가장 일반적인 방법은 **crates.io에 패키지를 publish**하는 것이다.

---

## 전제

`cargo install`은 실행 가능한 Rust 패키지를 설치하는 명령이다.

따라서 프로젝트는 binary crate여야 한다.

가장 단순한 구조는 다음과 같다.

```text
my-cli/
  Cargo.toml
  src/
    main.rs
```

`src/main.rs`가 있으면 Cargo는 기본적으로 실행 파일을 만든다.

---

## Cargo.toml 메타데이터 작성

crates.io에 배포하려면 `Cargo.toml`의 패키지 정보가 정리되어 있어야 한다.

예시:

```toml
[package]
name = "my-cli"
version = "0.1.0"
edition = "2021"
description = "A short description of my CLI tool"
license = "MIT"
repository = "https://github.com/example/my-cli"
readme = "README.md"
keywords = ["cli"]
categories = ["command-line-utilities"]

[dependencies]
```

중요한 항목은 다음과 같다.

```toml
name = "my-cli"
version = "0.1.0"
description = "A short description of my CLI tool"
license = "MIT"
repository = "https://github.com/example/my-cli"
readme = "README.md"
```

`name`은 crates.io에서 전역으로 유일해야 한다.

---

## 실행 파일 이름 지정

기본적으로 실행 파일 이름은 package name을 따른다.

```toml
[package]
name = "my-cli"
```

설치 후 실행 명령은 다음과 같다.

```bash
my-cli
```

패키지 이름과 실행 파일 이름을 다르게 하고 싶다면 `[[bin]]`을 사용한다.

```toml
[[bin]]
name = "mycli"
path = "src/main.rs"
```

이 경우 설치는 패키지 이름으로 하지만 실행은 binary 이름으로 한다.

```bash
cargo install my-cli
mycli
```

---

## README 작성

사용자가 설치와 사용 방법을 바로 확인할 수 있도록 README를 작성한다.

예시:

````markdown
# my-cli

A short description of my CLI tool.

## Installation

```bash
cargo install my-cli
```

## Usage

```bash
my-cli --help
```
````

---

## 배포 전 검증

publish 전에 기본 검사를 수행한다.

```bash
cargo fmt --check
cargo clippy -- -D warnings
cargo test
cargo build --release
```

패키지에 포함될 파일도 확인한다.

```bash
cargo package --list
```

불필요한 파일이 포함된다면 `Cargo.toml`에 `exclude`를 추가한다.

```toml
exclude = [
  ".github/",
  ".env",
  "target/",
]
```

반대로 포함할 파일만 명시할 수도 있다.

```toml
include = [
  "src/**",
  "Cargo.toml",
  "Cargo.lock",
  "README.md",
  "LICENSE*",
]
```

CLI 애플리케이션은 `Cargo.lock`을 포함하는 것이 보통 적절하다. 실행 프로그램은 의존성 버전을 고정하는 편이 재현 가능한 빌드에 유리하다.

---

## crates.io 로그인

crates.io 계정을 만들고 API 토큰을 발급한다.

그 후 로컬에서 로그인한다.

```bash
cargo login
```

토큰을 입력하면 로컬 Cargo 설정에 저장된다.

---

## dry-run 실행

실제 배포 전에 dry-run을 실행한다.

```bash
cargo publish --dry-run
```

이 단계에서 패키징, 메타데이터, 의존성 문제가 있는지 확인할 수 있다.

---

## publish 실행

문제가 없다면 배포한다.

```bash
cargo publish
```

배포 후 사용자는 다음 명령으로 설치할 수 있다.

```bash
cargo install my-cli
```

업데이트는 다음처럼 한다.

```bash
cargo install my-cli --force
```

---

## 버전 업데이트

crates.io에 이미 publish한 동일 버전은 다시 publish할 수 없다.

수정 사항을 배포하려면 `Cargo.toml`의 version을 올려야 한다.

```toml
version = "0.1.1"
```

이후 다시 publish한다.

```bash
cargo publish
```

---

## 잘못 배포한 버전 처리

crates.io에 publish한 버전은 삭제할 수 없다.

대신 `yank`로 새 의존성 선택에서 제외할 수 있다.

```bash
cargo yank --vers 0.1.0
```

되돌리려면 다음 명령을 사용한다.

```bash
cargo yank --vers 0.1.0 --undo
```

`yank`는 이미 해당 버전을 사용하는 사용자의 빌드를 즉시 깨뜨리는 삭제 기능이 아니다. 새로 의존성을 선택할 때 해당 버전을 피하게 만드는 기능이다.

---

## Git 저장소에서 직접 설치하기

crates.io에 올리지 않아도 Git 저장소에서 직접 설치할 수 있다.

```bash
cargo install --git https://github.com/example/my-cli
```

특정 브랜치를 설치할 수도 있다.

```bash
cargo install --git https://github.com/example/my-cli --branch main
```

특정 태그를 설치할 수도 있다.

```bash
cargo install --git https://github.com/example/my-cli --tag v0.1.0
```

다만 일반 사용자에게 배포할 목적이라면 다음 형태가 더 단순하다.

```bash
cargo install my-cli
```

따라서 공개 배포는 crates.io를 사용하는 편이 좋다.

---

## GitHub Actions로 자동 배포하기

태그를 push할 때 crates.io에 publish하도록 구성할 수 있다.

`.github/workflows/release.yml` 예시:

```yaml
name: Release

on:
  push:
    tags:
      - "v*.*.*"

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Check
        run: |
          cargo fmt --check
          cargo clippy -- -D warnings
          cargo test
          cargo publish --dry-run

      - name: Publish
        run: cargo publish
        env:
          CARGO_REGISTRY_TOKEN: ${{ secrets.CARGO_REGISTRY_TOKEN }}
```

GitHub repository의 Secrets에 다음 값을 등록한다.

```text
CARGO_REGISTRY_TOKEN
```

이 값은 crates.io에서 발급한 API 토큰이다.

---

## Windows 사용자를 고려할 때

`cargo install`은 사용자의 PC에서 소스 코드를 직접 빌드한다.

따라서 사용자는 Rust toolchain을 설치해야 한다. 일부 crate는 C toolchain이 필요할 수도 있다.

개발자 대상 CLI라면 `cargo install`만으로 충분할 수 있다.

일반 사용자 대상 CLI라면 GitHub Releases에 미리 빌드한 실행 파일도 함께 제공하는 것이 좋다.

예:

```text
my-cli-x86_64-pc-windows-msvc.zip
my-cli-x86_64-unknown-linux-gnu.tar.gz
my-cli-aarch64-apple-darwin.tar.gz
```

---

## 전체 흐름

정리하면 다음 순서로 진행한다.

```bash
# 1. 메타데이터 정리
vi Cargo.toml

# 2. 검증
cargo fmt --check
cargo clippy -- -D warnings
cargo test
cargo build --release

# 3. 패키징 확인
cargo package --list
cargo publish --dry-run

# 4. 로그인
cargo login

# 5. 배포
cargo publish

# 6. 설치 확인
cargo install my-cli
```

---

## 결론

Rust CLI 툴을 `cargo install`로 배포하려면 crates.io에 binary crate를 publish하면 된다.

핵심은 다음과 같다.

- `src/main.rs` 또는 `[[bin]]`으로 실행 파일을 제공한다.
    
- `Cargo.toml`에 crates.io용 메타데이터를 작성한다.
    
- `cargo publish --dry-run`으로 먼저 검증한다.
    
- `cargo publish`로 배포한다.
    
- 새 배포마다 version을 올린다.
    
- 일반 사용자 대상이면 GitHub Releases의 사전 빌드 실행 파일도 함께 고려한다.
    

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._