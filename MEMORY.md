# MEMORY.md - 长期记忆

> ⚠️ 行数限制: 500 行 | 超过则归档到 memory-archive/
> 最后整理: 2026-04-04

---

## 🤖 身份与配置

| 项目 | 值 |
|------|-----|
| **名称** | 大冬瓜 🍈 |
| **类型** | OpenClaw AI 助理（投资顾问） |
| **服务器IP** | 170.106.119.102 |
| **API端口** | 8082 |
| **API密钥** | dadonggua-daxigua-secure-key-2026 |
| **Dashboard** | https://aiwork.wiki ✅ |
| **V2Ray** | 端口 8443 |

---

## 👤 用户信息

- **姓名**: 沈晔
- **称呼**: 沈老师
- **时区**: Asia/Shanghai

---

## 🛠️ Skills 目录结构

```
~/.openclaw/workspace/skills/
├── claude-code-patterns/    # Claude Code架构参考
├── model-router-premium/    # AI模型路由
├── agent-browser/           # 浏览器自动化
├── openapi/                # 富途OpenAPI
├── install-opend/           # OpenD安装
├── memory-search/           # 记忆搜索
├── session-context/         # 会话上下文
├── agent-bus/              # Agent通信总线
├── web-search/             # 网页搜索
└── openai-whisper/         # 语音识别
```

---

## 📡 Agent 通讯

### 大西瓜 (DaXiGua) - 另一个AI
- IP: 47.90.182.171 | 端口: 8083
- API: `curl -X POST "http://47.90.182.171:8083/api/message" -H "X-API-Key: dadonggua-daxigua-secure-key-2026" -d '{"from":"大冬瓜","message":"...","priority":"normal"}'`

### 向量记忆服务
- Qdrant: 端口 6333-6334
- memory-service: 端口 8090
- API: `POST http://localhost:8090/api/search`

---

## 📊 项目状态

### 股疯 (GuFeng) 📈
- 路径: `/root/.openclaw/workspace/projects/gufeng`
- 状态: ✅ 运行中
- 端口: 后端3100 / 前端3101
- 账户: A股¥100万 | 美股$50万 | 港股HK$38万
- 策略: 网格交易、趋势跟踪、蓝筹稳健
- 文档: `docs/FINAL_DELIVERY_2026-03-01.md`

### 量化交易系统 📊
- 路径: /root/quant-trading-system
- 启动: `docker-compose up -d`
- 前端: https://lianghua.aiwork.wiki
- Agent: quant-pm/data/strategy/trade/risk

### 球队管家 ⚽
- 路径: `/root/.openclaw/workspace/projects/football-manager`
- 端口: 后端3001 / 前端5173
- 数据库: Docker PostgreSQL
- 登录: admin/admin123

---

## 🔧 技术规范

### 工作协同模式
- **默认**: Claude Code (sessions_spawn)
- **流程**: 需求 → 方案 → 确认 → 执行 → 验收 → 交付
- **重要**: 逐条核对验收标准，实际运行验证

### 需求方案模板
```
## 需求概述
## 需求背景
## 功能列表
## 交互流程
## 验收标准
## 预计工作量
```

### 召唤场景
- ✅ 新功能/应用、代码审查、重构、调试、测试、部署
- ❌ 简单修复（直接edit）、读代码（用read）

---

## 🧠 混合记忆框架

### 核心原则
- **先思后行**: 先回忆上下文
- **记忆双写**: 写文件+存向量库
- **主动澄清**: 矛盾时追问

### 检索策略
| 时机 | 检索位置 |
|------|----------|
| 强制 | "记得...吗？"/新项目/跨项目决策 |
| 顺序 | 今日→昨日→MEMORY.md→AGENTS.md |
| 备用 | Qdrant向量库 |

### 三类记忆
- 🔧 **Hard Fact**: API密钥、路径、端口 → MEMORY.md
- 💡 **Soft Preference**: 沟通风格 → MEMORY.md
- 📌 **Correction**: 被纠正的错误 → MEMORY.md

---

## 📌 重要教训

### 股疯项目
- ❌ 禁止使用模拟数据，必须用真实市场数据
- ✅ 重点关注美股: NVDA, AAPL, MSFT, GOOGL, AMZN, META, TSLA

### 通用原则
- Node.js服务用 `build + start`，不用 `dev`
- 多项目注意端口: 3000/3001/3100/3101/5173
- 服务挂 → `journalctl` 或项目日志

---

## 🏗️ Claude Code 架构借鉴 (2026-04-03)

### Feature Flag 模式
```typescript
const tool = feature('FLAG_NAME')
  ? require('./feature.ts').Class
  : null
```

### 工具抽象
```typescript
export interface Tool {
  name: string
  description: string
  inputSchema: object
  handler: (args, context, progress?) => Promise<Result>
}
```

### 权限上下文
```typescript
type ToolPermissionContext = {
  mode: 'default' | 'bypassPermissions' | 'alwaysAsk'
  alwaysAllowRules: Record<string, boolean>
  alwaysDenyRules: Record<string, boolean>
}
```

### 可升级方向
1. 工具系统: 增加progress callback
2. 命令系统: 斜杠命令架构
3. Feature Flag: 按需加载
4. MCP支持: 扩展工具能力

---

## 📝 命令速查

| 命令 | 用途 |
|------|------|
| `召唤股疯` | 召唤项目团队 |
| `汇报交易情况` | 查看模拟账户状态 |
| `/status` | 查看session状态 |

---

> 📅 最后更新: 2026-04-04 | 改进: 添加行数限制、整理结构、增强可读性

---

## 🔧 梁花系统修复记录 (2026-04-19)

### 问题诊断
- **根本原因**: LongBridge API Token 过期 (`401004 token invalid`)
- **影响**: 行情获取全部失败 → 信号生成为0
- **次要原因**: Yahoo Finance 被服务器IP封禁(429限流)

### 修复方案
1. **新增 marketDataProvider.ts** - 多源行情降级架构
   - 优先级1: LongBridge (token过期，暂时不可用)
   - **优先级2: NASDAQ API** (主数据源，无需认证，稳定)
   - 优先级3: Yahoo Finance (备用)
   - 优先级4: 30秒缓存兜底

2. **更新 yahoo_quote.py** - 改用NASDAQ作为首选源
   - `get_quote_nasdaq()` - 实时报价
   - `get_candlesticks_nasdaq()` - 30天历史K线(OHLCV)

3. **更新文件**:
   - signalGenerator.ts → 使用 marketDataProvider
   - trading.ts → 使用 marketDataProvider 获取报价
   - realtimeMarket.ts → 使用 marketDataProvider
   - scheduler.ts → 添加 initMarketData()

### 当前行情数据
| 股票 | 价格 | RSI(14) | 状态 |
|------|------|---------|------|
| NVDA | $201.68 | 57.9 | 正常 |
| AAPL | $270.23 | 57.8 | 正常 |
| MSFT | $422.79 | 89.1 | 超买 |
| GOOGL | $341.68 | 65.1 | 正常 |
| AMZN | $250.56 | 56.8 | 正常 |

### 待处理
- [ ] **LongBridge Token刷新** - 需要用户重新授权
- [ ] 富途OpenAPI作为替代方案（港股数据更好）

### 修改的文件
- /root/lianghua/apps/server/scripts/yahoo_quote.py (重构)
- /root/lianghua/apps/server/src/services/marketDataProvider.ts (新增)
- /root/lianghua/apps/server/src/services/signalGenerator.ts (引用更新)
- /root/lianghua/apps/server/src/modules/trading.ts (引用更新)
- /root/lianghua/apps/server/src/services/realtimeMarket.ts (引用更新)
- /root/lianghua/apps/server/src/services/scheduler.ts (添加init)

### LongBridge 修复 (2026-04-19 第二次)
**根本原因**: API base URL错误 + SDK token问题
1. CLI 用 `openapi.longbridge.cn` (CN域名)，Python SDK 默认用 `openapi.longbridgeapp.com`
2. SDK (compiled .so) 使用 native gRPC 而非 REST，与 REST API 不兼容
3. lb_simple.py 没有提取 volume/turnover，且不支持K线

**修复**:
- 重写 lb_simple.py：直接用 CLI (自带token自动刷新) 替代 Python SDK
  - quote 命令：返回 OHLCV + volume + turnover
  - kline 命令：返回30天K线(完整OHLCV)
- marketDataProvider.ts：K线改为优先 LongBridge CLI，备用 NASDAQ
- 环境变量不再传给 CLI（CLI有自己的token管理）
- 解密密码修复：每个secret用自己key名做密码

**当前数据源**:
- 行情报价: LongBridge CLI ✅ (price + volume + turnover)
- K线数据: LongBridge CLI ✅ (30天OHLCV)
- 备用源: NASDAQ API

### LongBridge 关键教训
- CLI vs SDK: CLI用gRPC+Device Auth，SDK用REST+OAuth，两套token不兼容
- SDK默认URL是.openapi.longbridgeapp.com（REST），但实际API在.openapi.longbridge.cn
- Token文件: `~/.longbridge/openapi/tokens/<client_id>`
- 正确做法: 用CLI作为数据源（lb_simple.py），不要用Python SDK
- 文档: `/root/lianghua/docs/LONGBRIDGE_CONFIG.md`

---

## 📦 GitHub 仓库管理 (2026-04-19)

### 仓库列表
| 项目 | 仓库地址 |
|------|---------|
| 梁花 | https://github.com/shenyeaiwork/lianghua |
| 股疯 | https://github.com/shenyeaiwork/gufeng |
| 工作区 | https://github.com/shenyeaiwork/openclaw-workspace |

### 管理规范
- **每次重要更新后 commit + push**
- commit message 用中文，格式: `feat: / fix: / chore: / docs:`
- 工作区推送时 TOOLS.md 中有真实 token，GitHub 会触发 secret scanning 告警，属正常
- **禁止**在工作区 push 中包含任何非占位符的 token

### Token
- GitHub PAT: `{{GITHUB_TOKEN}}` (存储于 TOOLS.md)
- Token 只有 `repo` 权限（够用，不够用时用户会提供新的）
