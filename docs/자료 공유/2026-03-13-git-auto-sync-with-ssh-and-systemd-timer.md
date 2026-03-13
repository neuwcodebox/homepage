# Git SSH 키와 systemd timer로 Git 자동 동기화 설정하기

주기적으로 `git pull`, `git add`, `git commit`, `git push`를 자동 실행하려면 인증과 스케줄링을 함께 구성해야 한다.

이 글에서는 다음 구성을 기준으로 절차를 정리한다.

- Git 원격 저장소 인증: SSH
    
- 인증 방식: 자동화 전용 무암호 키
    
- 주기 실행: `systemd --user` timer
    

## 왜 `ssh-agent` 방식이 아니라 전용 키를 쓰는가

터미널에서 수동으로 Git을 사용할 때는 다음 방식이 가능하다.

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

하지만 자동 실행 환경에서는 이 방식이 안정적이지 않다.

- `cron`이나 `systemd`는 로그인 셸 환경을 그대로 사용하지 않을 수 있다
    
- `SSH_AUTH_SOCK`가 없을 수 있다
    
- 부팅, 로그아웃, 세션 종료 시 agent 상태가 사라질 수 있다
    

자동 실행에는 **자동화 전용 SSH 키를 별도로 만들고, Git이 그 키를 직접 사용하게 하는 방식**이 단순하다.

## 1. 자동화 전용 SSH 키 생성

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_autogit -C "autogit"
```

패스프레이즈 입력은 비워 둔다.

권한을 설정한다.

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519_autogit
chmod 644 ~/.ssh/id_ed25519_autogit.pub
```

공개키를 확인한다.

```bash
cat ~/.ssh/id_ed25519_autogit.pub
```

출력된 공개키를 GitHub의 **Settings → SSH and GPG keys → New SSH key**에 등록한다.

## 2. SSH config에 자동화용 호스트 추가

`~/.ssh/config`에 다음을 추가한다.

```sshconfig
Host github-autogit
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_autogit
  IdentitiesOnly yes
```

권한을 설정한다.

```bash
chmod 600 ~/.ssh/config
```

연결을 테스트한다.

```bash
ssh -T git@github-autogit
```

처음 접속이면 호스트 키 확인이 나오며, `yes`를 입력하면 된다.

## 3. Git remote를 자동화용 호스트로 변경

저장소에서 현재 remote를 확인한다.

```bash
git remote -v
```

예를 들어 기존 값이 다음과 같다면:

```text
git@github.com:ORG/REPO.git
```

다음처럼 변경한다.

```bash
git remote set-url origin git@github-autogit:ORG/REPO.git
```

`git@github.com`이 아니라 `git@github-autogit`으로 했는지 다시 확인한다.

```bash
git remote -v
```

정상이라면 fetch, push 모두 `git@github-autogit:...` 형태로 표시된다.

이 단계가 빠지면 자동 실행 시 다음 오류가 발생할 수 있다.

```text
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
```

즉, SSH config에 별칭을 만들었더라도 **remote가 그 별칭을 실제로 사용해야** 한다.

## 4. 자동 동기화 스크립트 작성

예를 들어 `~/bin/git-auto-sync.sh` 파일을 만든다.

```bash
mkdir -p ~/bin
nano ~/bin/git-auto-sync.sh
```

내용:

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/USER/path/to/repo"
BRANCH="main"

cd "$REPO_DIR"

git pull --rebase origin "$BRANCH"
git add -A

if ! git diff --cached --quiet; then
  git commit -m "chore: automated sync"
  git push origin "$BRANCH"
fi
```

실행 권한을 준다.

```bash
chmod +x ~/bin/git-auto-sync.sh
```

저장소에 사용자 정보를 설정한다.

```bash
git config user.name "Auto Bot"
git config user.email "you@example.com"
```

## 5. systemd user service 작성

user 단위 systemd 디렉터리를 만든다.

```bash
mkdir -p ~/.config/systemd/user
```

`~/.config/systemd/user/git-auto-sync.service`:

```ini
[Unit]
Description=Auto sync git repository

[Service]
Type=oneshot
ExecStart=%h/bin/git-auto-sync.sh
```

## 6. systemd user timer 작성

`~/.config/systemd/user/git-auto-sync.timer`:

```ini
[Unit]
Description=Run git auto sync every 10 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=10min
Persistent=true

[Install]
WantedBy=timers.target
```

의미는 다음과 같다.

- `OnBootSec=1min`: 부팅 후 1분 뒤 첫 실행
    
- `OnUnitActiveSec=10min`: 마지막 실행 후 10분 뒤 다시 실행
    
- `Persistent=true`: 시스템이 꺼져 있어 놓친 실행이 있으면 다음 기회에 보완
    

## 7. service와 timer 적용

```bash
systemctl --user daemon-reload
systemctl --user enable --now git-auto-sync.timer
```

상태를 확인한다.

```bash
systemctl --user list-timers
systemctl --user status git-auto-sync.timer
```

수동으로 즉시 실행하려면:

```bash
systemctl --user start git-auto-sync.service
systemctl --user status git-auto-sync.service
```

로그는 다음으로 확인한다.

```bash
journalctl --user -u git-auto-sync.service -n 100 --no-pager
```

## 8. `loginctl enable-linger`의 의미

`systemctl --user`로 등록한 timer는 사용자 세션과 관련된다.

다음 명령을 실행하면:

```bash
loginctl enable-linger $USER
```

로그인 세션이 없어도 해당 사용자의 `systemd --user` 인스턴스가 계속 유지된다.

즉, 재부팅 후 사용자가 다시 로그인하지 않아도 user timer가 계속 동작할 수 있다.

확인은 다음으로 한다.

```bash
loginctl show-user $USER
```

출력에 `Linger=yes`가 보이면 활성화된 상태다.

## 9. 최종 점검 순서

자동 동기화가 정상 동작하려면 다음이 모두 맞아야 한다.

1. 공개키가 GitHub에 등록되어 있다
    
2. `~/.ssh/config`에 `github-autogit`이 설정되어 있다
    
3. Git remote가 `git@github-autogit:...` 형태다
    
4. 스크립트 경로와 저장소 경로가 정확하다
    
5. `systemd --user` service와 timer가 로드되어 있다
    

## 핵심 정리

자동 동기화 설정의 핵심은 두 가지다.

첫째, 자동 실행 환경에서는 `ssh-agent`에 의존하지 말고 **무암호 자동화 전용 SSH 키를 별도로 사용한다**.

둘째, `systemd --user`의 **service + timer** 조합으로 주기 실행을 구성하고, 필요하면 `loginctl enable-linger`로 로그인 여부와 무관하게 타이머가 계속 동작하게 한다.

이 구성을 적용하면 Git 저장소의 자동 동기화를 비교적 단순하게 운영할 수 있다.

---

_이 글은 사람의 확인을 거쳤으나 AI로 작성되어 부정확할 수 있습니다._