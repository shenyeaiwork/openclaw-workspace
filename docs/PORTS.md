# 端口管理文档

> 本文件记录所有服务的端口分配，避免冲突

---

## 端口分配表

| 端口 | 服务 | 项目 | 状态 | 说明 |
|------|------|------|------|------|
| **22** | SSH | 系统 | ✅ | SSH 远程登录 |
| **25** | SMTP | 系统 | ✅ | 邮件发送 |
| **80** | HTTP | nginx | ✅ | 常规 HTTP |
| **443** | HTTPS | nginx | ✅ | SSL/HTTPS |
| **888** | phpMyAdmin | nginx | ✅ | 数据库管理面板 |
| **8090** | HTTP Alt | nginx | ✅ | 备用 HTTP 端口 |
| **24563** | Python 服务 | 系统 | ✅ | 未知用途 |
| **5000** | Python 服务 | 系统 | ✅ | 未知用途 |

---

## PM2 托管服务

### 1. OpenClaw 核心

| 端口 | 服务 | 项目 | 状态 | 说明 |
|------|------|------|------|------|
| 18789 | OpenClaw Gateway | openclaw | ✅ | 主 API 入口 |
| 18791 | Gateway Alt | openclaw | ✅ | 备用端口 |
| 18792 | Gateway Alt | openclaw | ✅ | 备用端口 |

### 2. 股疯系统 (gufeng)

| 端口 | 服务 | 项目 | 状态 | 说明 |
|------|------|------|------|------|
| **3100** | 后端 API | gufeng | ✅ | 代码有语法错误，待修复 |
| **3101** | 前端 Web | gufeng | ✅ | 股疯投资系统主页 |
| **3102** | Agent 监控 | gufeng | ✅ | /agents-workhome/ |

### 3. 球队管家 (football-manager)

| 端口 | 服务 | 项目 | 状态 | 说明 |
|------|------|------|------|------|
| **3001** | 后端 API | football-manager | ✅ | fm-backend |
| **5173** | 前端 Web | football-manager | ✅ | fm-frontend |

### 4. 外部服务

| 端口 | 服务 | 位置 | 状态 | 说明 |
|------|------|------|------|------|
| 5432 | PostgreSQL | Docker | ✅ | 球队管家数据库 |
| 8443 | V2Ray | Docker | ✅ | VPN 翻墙服务 |

---

## Nginx 代理配置

| 域名/路径 | 代理目标 | 说明 |
|-----------|----------|------|
| aiwork.wiki | 127.0.0.1:18789 | OpenClaw Gateway |
| aiwork.wiki/agents-workhome/ | 127.0.0.1:3102 | Agent 监控页面 |
| aiwork.wiki/api/agents-status/ | 127.0.0.1:3102 | Agent 状态 API |

---

## 远程服务器

### 大冬瓜 (DaDongGua)
- IP: 170.106.119.102
- API: 8082
- 备注: OpenClaw AI 助理

### 大西瓜 (DaXiGua)
- IP: 47.90.182.171
- API: 8083 (旧) / 8081
- 状态: ⚠️ 当前无法连接

---

## 端口规划建议

### 端口段分配
- **1xxx**: OpenClaw 核心服务
- **2xxx**: 预留
- **3xxx**: 股疯项目 (gufeng)
- **4xxx**: 预留
- **5xxx**: 球队管家 (football-manager)
- **8xxx**: 外部/系统服务

### 避免冲突规则
1. 新服务启用前检查 `netstat -tlnp`
2. 更新本文件记录新端口
3. 使用 4 位端口号便于记忆

---

## 快速检查命令

```bash
# 查看所有监听端口
netstat -tlnp | grep LISTEN

# 查看 PM2 服务状态
pm2 list

# 测试端口连通性
curl http://127.0.0.1:<端口>/health
```

---

*最后更新: 2026-03-07*
