# HEARTBEAT.md

> 心跳任务清单 | 检查周期: 每30分钟

---

## 🚨 核心检查任务

### 1️⃣ PM2 进程检查
```bash
pm2 list
```
**异常处理**: 如果股疯/量化系统不在运行 → 重启

### 2️⃣ Nginx 服务检查
```bash
systemctl is-active nginx
```
**异常处理**: 如果停止 → `systemctl restart nginx`

### 3️⃣ HTTPS 访问检查
```bash
curl -sk https://aiwork.wiki/ -o /dev/null && echo "✅ OK" || echo "❌ FAIL"
```
**异常处理**: FAIL时尝试重启nginx

### 4️⃣ Session 上下文保存
```bash
python3 ~/.openclaw/skills/session-context/scripts/save-context.py
```

---

## 📊 健康状态判断

| 状态 | 含义 |
|------|------|
| ✅ OK | 所有检查通过 |
| ⚠️ WARNING | 部分服务异常，不影响核心功能 |
| 🚨 CRITICAL | 核心服务宕机，需要立即处理 |

---

## 📋 执行报告模板

每次心跳后记录:
```
[HH:MM] 心跳检查
- PM2: ✅/❌ [进程名]
- Nginx: ✅/❌
- HTTPS: ✅/❌
- Session: ✅/❌
```

---

## 💡 心跳原则

- 只报告异常，正常的回复 HEARTBEAT_OK
- 夜间 (23:00-08:00) 只报告严重问题
- 连续3次异常才触发告警，避免抖动

---

## 🔧 快速修复命令

```bash
# 重启股疯
cd /root/.openclaw/workspace/projects/gufeng && pm2 restart server

# 重启量化
cd /root/quant-trading-system && docker-compose restart

# 重启nginx
systemctl restart nginx

# 重启session服务
pm2 restart session-context
```
