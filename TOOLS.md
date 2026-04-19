# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## GitHub
- Token: {{GITHUB_TOKEN}}

## Agent 通信
### 发消息给总经理
- sessions_send: 可以直接发消息给总经理的 session
- 总经理 workspace: /root/.openclaw/workspace-zongjingli

### 查询向量记忆
```bash
curl -X POST "http://localhost:8090/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "查询内容"}'
```

Add whatever helps you do your job. This is your cheat sheet.
