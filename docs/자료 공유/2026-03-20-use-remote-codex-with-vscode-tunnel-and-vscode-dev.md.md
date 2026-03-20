# Codex를 데스크톱 웹 UI로 원격 사용하는 방법: VS Code Tunnel과 vscode.dev 셋업

원격지 리눅스 서버에 `Codex CLI`를 설치해 두고, 내 기기에서 웹 UI로 사용하고 싶었다.

처음에는 `Happy`, `Happier` 같은 전용 프로젝트를 사용해 봤다. 목적 자체는 정확했다. 원격지의 코딩 에이전트를 웹이나 모바일 UI로 다루게 해 주는 도구들이다.  
하지만 실제로 써보면 자잘한 오류가 반복되어 안정적으로 쓰기 어려웠다. 세션 연결, UI 동작, 사용 흐름 면에서 메인 작업 환경으로 삼기에는 부담이 있었다.

그래서 방향을 바꿨다.  
전용 Codex 웹 UI를 찾기보다, **VS Code CLI로 터널을 열고 `vscode.dev`로 접속한 뒤 VS Code 안에서 Codex 확장을 사용하는 방식**이 더 현실적이었다.

# 최종 구성

구성은 단순하다.

```text
원격 리눅스 서버
├ Codex CLI
├ VS Code CLI
└ code tunnel 실행

내 기기
└ 웹 브라우저
  └ vscode.dev 접속
    └ 동일한 GitHub 계정으로 로그인
      └ Codex 확장 사용
```

핵심은 다음 두 가지다.

1. 서버에서 `code tunnel`을 실행한다.
    
2. 브라우저에서 `vscode.dev`에 접속하고 **터널을 연 것과 동일한 GitHub 계정으로 로그인**한다.
    

이렇게 하면 브라우저에서 원격 VS Code를 열 수 있다.

# 왜 이 방법이 나았나

처음 후보였던 `Happy`, `Happier` 같은 프로젝트는 전용 UI라는 장점이 있었다.  
하지만 실제 사용에서는 자잘한 오류가 반복되었다. 원격 세션 연결, UI 반응, 전체 사용 흐름이 안정적이지 않았다.

반면 이 방법은 역할이 명확했다.

- 원격 연결은 VS Code Tunnel이 담당
    
- 웹 UI는 `vscode.dev`가 담당
    
- AI 코딩은 Codex 확장이 담당
    

전용 서드파티 프로젝트 하나에 모든 걸 기대하는 것보다 훨씬 단순했다.

# 셋업 방법

아래는 같은 상황에서 바로 따라 할 수 있는 최소 셋업 절차다.

## 1. 서버 준비

원격 리눅스 서버에 다음이 준비되어 있으면 된다.

- `curl`
    
- `tar`
    
- `tmux`
    
- `git`
    
- `Node.js`
    
- `npm`
    

Ubuntu 계열이라면 먼저 기본 패키지를 설치한다.

```bash
sudo apt-get update
sudo apt-get install -y curl tar tmux git
```

Node.js와 npm이 없다면 설치한다.

```bash
sudo apt-get install -y nodejs npm
```

설치 후 버전을 확인한다.

```bash
node -v
npm -v
git --version
tmux -V
```

## 2. Codex CLI 설치

서버에 Codex CLI를 설치한다.

```bash
npm install -g @openai/codex
```

설치 후 동작을 확인한다.

```bash
codex --version
```

Codex CLI는 터미널에서 실행되는 코딩 에이전트다. 이후 VS Code 확장을 쓰더라도 서버 쪽에 Codex 환경이 준비되어 있는 편이 흐름을 맞추기 쉽다.

## 3. VS Code CLI 설치

VS Code Tunnel을 열려면 `code` CLI가 필요하다.

적당한 곳에 VS Code CLI 아카이브를 받는다.
(아키텍처에 따라 다운로드 URL에서 x64를 arm64로 바꾸는 등 주의 필요)

```bash
mkdir -p ~/opt/vscode-cli
cd ~/opt/vscode-cli
curl -Lk 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' --output vscode_cli.tar.gz
tar -xf vscode_cli.tar.gz
chmod +x ./code
```

설치가 끝나면 버전을 확인한다.

```bash
./code --version
```

편하게 쓰고 싶다면 심볼릭 링크를 만든다.

```bash
mkdir -p ~/.local/bin
ln -sf ~/opt/vscode-cli/code ~/.local/bin/code
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
code --version
```

이제 `code tunnel` 명령을 사용할 수 있다.

## 4. tmux에서 터널 열기

터널은 계속 살아 있어야 하므로 `tmux` 안에서 실행하는 것이 편하다.

새 세션을 만든다.

```bash
tmux new -s vscode-tunnel
```

그 안에서 터널을 실행한다.

```bash
code tunnel --accept-server-license-terms
```

처음 실행하면 로그인 절차가 나온다.  
안내에 따라 인증을 완료하면 접속 가능한 URL 또는 연결 가능한 터널 정보가 출력된다.

실행 후 `tmux`는 분리해 두면 된다.

```text
Ctrl-b d
```

이렇게 하면 터널은 계속 살아 있고, 셸만 빠져나온다.

다시 붙을 때는 다음 명령을 사용하면 된다.

```bash
tmux attach -t vscode-tunnel
```

## 5. 내 기기에서 접속

브라우저에서 `vscode.dev`에 접속한다.

여기서 **서버에서 터널을 열 때 사용한 것과 동일한 GitHub 계정으로 로그인**해야 한다.  
계정이 다르면 해당 터널에 접근할 수 없다.

로그인 후 원격 터널을 선택하면 브라우저에서 원격 VS Code가 열린다.

## 6. Codex 확장 설치

원격 VS Code가 열리면 확장 프로그램 탭에서 `Codex` 확장을 설치한다.

이제 터미널 대신 VS Code UI 안에서 Codex를 사용할 수 있다.

# 실제 사용 흐름

내가 사용한 흐름은 아래와 같았다.

## 서버 측

```bash
tmux new -s vscode-tunnel
code tunnel --accept-server-license-terms
```

## 클라이언트 측

1. 웹 브라우저에서 `vscode.dev` 접속
    
2. 동일한 GitHub 계정으로 로그인
    
3. 원격 서버 연결
    
4. Codex 확장 설치
    
5. VS Code UI로 Codex 사용
    

이 과정을 거치니 원하던 형태에 가깝게 동작했다.

# 정리

원격지에 있는 Codex를 내 기기에서 웹 UI로 사용하려고 여러 방법을 찾아봤다.

처음에는 `Happy`, `Happier` 같은 전용 프로젝트를 시도했지만, 실제 사용에서는 자잘한 오류 때문에 안정적으로 쓰기 어려웠다.

그래서 더 찾아본 결과, **VS Code CLI로 터널을 열고 `vscode.dev`로 접속하는 방식**이 더 현실적이었다.  
터널과 동일한 GitHub 계정으로 로그인하면 웹 브라우저에서 원격 VS Code를 사용할 수 있었고, 여기에 `Codex` 확장 프로그램을 설치하니 원하는 형태로 잘 동작했다.

같은 상황이라면 다음 순서로 진행하면 된다.

1. 원격 서버에 Codex CLI와 VS Code CLI를 설치한다.
    
2. `tmux`에서 `code tunnel`을 실행한다.
    
3. 브라우저에서 `vscode.dev`에 접속한다.
    
4. 동일한 GitHub 계정으로 로그인한다.
    
5. 원격 터널에 연결한다.
    
6. Codex 확장을 설치한다.
    

전용 Codex 웹 UI를 억지로 찾기보다,  
**공식 VS Code 원격 개발 경로 위에 Codex 확장을 올리는 방식이 현재로서는 더 실용적이었다.**

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._