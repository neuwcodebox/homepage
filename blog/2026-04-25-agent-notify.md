# agent-notify

Codex CLI에서도 이미지 생성이 가능해져서 짤을 자동으로 만들어서 어디로 보내주는 그런 자동화를 간단히 해볼까 싶었음. 그래서 [agent-notify](https://github.com/neuwcodebox/agent-notify)라는 CLI 툴과 스킬을 만들었다. ~~물론 Codex가~~

{/* truncate */}

![file 20260425160942329](https://cdn.neuwappbox.com/post/2026/04/25/attachments/blog/2026-04-25-agent-notify/file-20260425160942329.png)
(Codex로 생성하고 수정한 이미지)

별 건 아니고 그냥 초기 설정만 해주면 `notify send --channel personal --title "Image" --body "Generated image:" --file ./image.png` 이렇게 파일과 함께 메시지를 보낼 수 있다.
디스코드, 텔레그램 등등...

설정 예)

```toml
default_channel = "discord"

[channels.discord]
type = "discord-webhook"
webhook_url = "https://discord.com/api/webhooks/..."
username = "Agent Notify"
allow_mentions = false
```

AI Agent가 쓰는 걸 상정했기 때문에 스킬도 제작했다.
`https://github.com/neuwcodebox/agent-notify/tree/main/skills/notification 스킬 설치해줘` 뭐 이런식으로 요청하면 아마 설치해줄 거다.

그럼 `귀여운 고양이 이미지 생성 후 discord 채널로 알려줘` 이렇게 요청하면 이미지 만들어서 보내준다.

![file 20260425161627317](https://cdn.neuwappbox.com/post/2026/04/25/attachments/blog/2026-04-25-agent-notify/file-20260425161627317.png)
