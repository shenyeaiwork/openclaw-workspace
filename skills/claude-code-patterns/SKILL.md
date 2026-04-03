---
name: claude-code-patterns
description: Claude Code核心架构设计模式借鉴。用于分析和参考Claude Code源码(位于/root/.openclaw/workspace/Claude-code-open/)中的设计模式，包括：工具注册模式、Feature Flag系统、权限上下文传递、记忆系统、多智能体Swarm架构。当需要设计新工具、扩展系统能力、借鉴Claude Code架构时触发。
---

# Claude Code 架构设计模式

## 核心架构

```
Claude Code
├── 运行时: Bun (JavaScript/TypeScript运行时+打包器)
├── UI框架: React + Ink (终端UI)
├── 语言: TypeScript 5.x
├── AI SDK: @anthropic-ai/sdk
└── MCP SDK: @modelcontextprotocol/sdk
```

## 源码路径
`/root/.openclaw/workspace/Claude-code-open/src/`

## 核心模块

| 模块 | 说明 |
|------|------|
| `tools/` | 30+内置工具(FileEdit, Bash, Agent, WebSearch等) |
| `commands/` | 70+斜杠命令 |
| `services/` | API、MCP、OAuth、Analytics |
| `utils/` | 权限、swarm、shell、model等 |
| `plugins/` | 插件系统 |
| `skills/` | Skills体系 |
| `bridge/` | 远程桥接(WebSocket/SSE) |
| `memdir/` | 持久化记忆管理 |

## 关键设计模式

### 1. 工具注册模式

**基础工具直接导入：**
```typescript
import { FileEditTool } from './tools/FileEditTool/FileEditTool.js'
import { BashTool } from './tools/BashTool/BashTool.js'
```

**特性工具条件导入(dead code elimination)：**
```typescript
const REPLTool = process.env.USER_TYPE === 'ant' 
  ? require('./tools/REPLTool/REPLTool.js').REPLTool 
  : null

const cronTools = feature('AGENT_TRIGGERS')
  ? [CronCreateTool, CronDeleteTool, CronListTool]
  : []
```

### 2. Feature Flag系统

```typescript
import { feature } from 'bun:bundle'

// 条件加载功能模块
const proactive = feature('PROACTIVE') || feature('KAIROS')
  ? require('./commands/proactive.js').default
  : null

// 特性检测
if (feature('BRIDGE_MODE')) {
  // 加载桥接模式
}
```

### 3. 权限上下文

```typescript
export type ToolPermissionContext = DeepImmutable<{
  mode: PermissionMode  // default | bypassPermissions | alwaysAsk
  additionalWorkingDirectories: Map<string, AdditionalWorkingDirectory>
  alwaysAllowRules: ToolPermissionRulesBySource
  alwaysDenyRules: ToolPermissionRulesBySource
  alwaysAskRules: ToolPermissionRulesBySource
  isBypassPermissionsModeAvailable: boolean
  shouldAvoidPermissionPrompts?: boolean
}>
```

### 4. 工具抽象接口

```typescript
export interface Tool {
  name: string
  description: string
  inputSchema: ToolInputJSONSchema
  handler: (
    args: any, 
    context: ToolPermissionContext,
    progress?: (update: ToolProgressData) => void
  ) => Promise<ToolResult>
}
```

### 5. 记忆系统 Truncation

```typescript
const MAX_ENTRYPOINT_LINES = 200
const MAX_ENTRYPOINT_BYTES = 25_000

export function truncateEntrypointContent(raw: string): EntrypointTruncation {
  const trimmed = raw.trim()
  const contentLines = trimmed.split('\n')
  
  const wasLineTruncated = contentLines.length > MAX_ENTRYPOINT_LINES
  const wasByteTruncated = trimmed.length > MAX_ENTRYPOINT_BYTES
  
  // 先按行截断，再按字节截断
  let truncated = wasLineTruncated
    ? contentLines.slice(0, MAX_ENTRYPOINT_LINES).join('\n')
    : trimmed
    
  return { content: truncated, wasLineTruncated, wasByteTruncated }
}
```

### 6. 多智能体Swarm

```typescript
// src/utils/swarm/
├── backends/          // Tmux/iTerm2等后端
├── constants.ts
├── inProcessRunner.ts
├── spawnInProcess.ts
├── teamHelpers.ts
├── teammateInit.ts
├── teammateLayoutManager.ts
├── teammateModel.ts
└── leaderPermissionBridge.ts  // 权限桥接
```

## 工具列表(部分)

| 工具 | 文件 | 说明 |
|------|------|------|
| FileReadTool | tools/FileReadTool/ | 读取文件 |
| FileEditTool | tools/FileEditTool/ | 编辑文件 |
| FileWriteTool | tools/FileWriteTool/ | 写入文件 |
| BashTool | tools/BashTool/ | 执行Shell |
| GlobTool | tools/GlobTool/ | Glob匹配 |
| GrepTool | tools/GrepTool/ | 文本搜索 |
| WebSearchTool | tools/WebSearchTool/ | 网络搜索 |
| WebFetchTool | tools/WebFetchTool/ | URL抓取 |
| AgentTool | tools/AgentTool/ | Agent调用 |
| SkillTool | tools/SkillTool/ | Skill调用 |
| TaskCreateTool | tools/TaskCreateTool/ | 创建任务 |
| TaskListTool | tools/TaskListTool/ | 列表任务 |
| TeamCreateTool | tools/TeamCreateTool/ | 创建团队 |
| SendMessageTool | tools/SendMessageTool/ | 发送消息 |
| MCPTool | tools/MCPTool/ | MCP协议 |

## 斜杠命令(部分)

位于 `src/commands/`:
- `/add-dir` - 添加目录
- `/agent` - Agent操作
- `/brief` - 简要模式
- `/clear` - 清除对话
- `/commit` - 提交代码
- `/config` - 配置管理
- `/doctor` - 诊断检查
- `/help` - 帮助
- `/init` - 初始化
- `/mcp` - MCP管理
- `/plan` - 计划模式
- `/skills` - Skills管理
- `/task` - 任务管理
- `/theme` - 主题切换

## 参考文档

- 详细架构图: `references/architecture-details.md`
- 工具开发指南: `references/tool-development.md`
- MCP协议说明: `references/mcp-protocol.md`
