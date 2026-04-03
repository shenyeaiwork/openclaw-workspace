# 📋 大冬瓜命令速查

> 创建时间: 2026-04-04

---

## 🚀 直接命令

| 命令 | 触发 | 说明 |
|------|------|------|
| `召唤股疯` | 股疯项目 | 召唤股疯团队讨论 |
| `汇报交易情况` | 股疯 | 查看当前模拟账户状态 |
| `自我升级` | 学习 | 基于Claude Code架构自我提升 |

---

## 🔧 项目管理

### 股疯 (GuFeng)
```bash
# 查看状态
curl http://localhost:3100/api/sim/accounts

# 查看持仓
curl http://localhost:3100/api/sim/all-positions

# 查看信号
curl http://localhost:3100/api/sim/signals

# 更新价格
curl -X POST http://localhost:3100/api/sim/update-prices
```

### 量化交易系统
```bash
# 重启
cd /root/quant-trading-system && docker-compose restart

# 查看日志
docker-compose logs -f backend

# 查看前端
curl http://localhost:3002
```

---

## 📊 状态检查

### 服务健康检查
```bash
# PM2
pm2 list

# Nginx
systemctl status nginx

# Docker
docker ps
```

### API 测试
```bash
# 大冬瓜API
curl -X POST "http://localhost:8082/api/message" \
  -H "X-API-Key: dadonggua-daxigua-secure-key-2026" \
  -d '{"from":"test","message":"ping"}'

# 向量记忆
curl -X POST http://localhost:8090/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"测试"}'
```

---

## 🛠️ 开发者命令

### Git 操作
```bash
# 提交更改
git add . && git commit -m "描述"

# 查看状态
git status

# 查看日志
git log --oneline -10
```

### 文件操作
```bash
# 查看内存占用
ls -lh ~/.openclaw/workspace/memory/

# 压缩旧记忆
tar -czf memory-archive-$(date +%Y%m).tar.gz memory-archive/

# 清理临时文件
find ~/.openclaw/workspace -name "*.tmp" -delete
```

---

## 📝 会话管理

### Session 操作
```bash
# 查看所有session
openclaw session list

# 查看当前状态
openclaw status

# 重启gateway
openclaw gateway restart
```

---

## 💡 使用提示

1. **模糊匹配**: 命令不需要完全匹配，如"交易情况"即可触发汇报
2. **自然语言**: 可以直接说"帮我看看股疯的持仓"
3. **上下文记忆**: 对话中途可以直接说"那个项目怎么样了"

---

## 🔗 相关文档

- [MEMORY.md](../MEMORY.md) - 长期记忆
- [AGENTS.md](../AGENTS.md) - 工作区规范
- [SOUL.md](../SOUL.md) - 性格设定
