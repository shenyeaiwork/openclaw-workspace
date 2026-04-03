# Claude Code 架构详解

## 源码结构

```
Claude-code-open/src/
├── entrypoints/           # 程序入口点
│   ├── cli.tsx           # CLI入口
│   ├── mcp.ts            # MCP服务器入口
│   └── agentSdk.ts       # SDK入口
├── main.tsx              # 主启动逻辑 (800KB+)
├── commands.ts           # 70+斜杠命令注册
├── tools.ts              # 30+工具注册
├── Tool.ts               # 工具抽象定义
├── query.ts              # 查询引擎
├── QueryEngine.ts        # 查询引擎核心
├── context.ts            # React Context
├── state/                # 状态管理
├── hooks/                # React Hooks
├── components/           # 100+ React/Ink UI组件
├── screens/              # 主屏幕
├── services/             # 后端服务
│   ├── api/             # Anthropic API客户端
│   ├── mcp/             # MCP客户端
│   ├── oauth/           # OAuth认证
│   ├── analytics/       # 分析追踪
│   └── ...
├── utils/                # 工具函数库
│   ├── model/           # 模型管理
│   ├── permissions/     # 权限系统
│   ├── swarm/           # 多智能体编排
│   ├── shell/           # Shell提供商
│   ├── settings/        # 配置管理
│   ├── fsOperations/    # 文件操作
│   └── ...
├── plugins/              # 插件加载器
├── skills/               # Skills体系
├── bridge/               # 远程桥接
├── memdir/               # 持久化记忆
└── vendor/               # 原生模块
    ├── audio-capture-src/
    ├── image-processor-src/
    └── url-handler-src/
```

## 工具系统架构

### 工具基类结构

```typescript
// Tool.ts
export type ToolInputJSONSchema = {
  [x: string]: unknown
  type: 'object'
  properties?: { [x: string]: unknown }
}

export interface Tool {
  name: string
  description: string
  inputSchema: ToolInputJSONSchema
  
  // 核心执行函数
  handler: (
    args: any,
    context: ToolPermissionContext,
    progress?: (update: ToolProgressData) => void
  ) => Promise<ToolResult>
  
  // 可选：权限规则
  permissionRules?: ToolPermissionRules
  
  // 可选：条件启用
  isAvailable?: (context: ToolPermissionContext) => boolean
}
```

### 工具注册流程

```typescript
// tools.ts - 集中注册
import { FileEditTool } from './tools/FileEditTool/FileEditTool.js'
import { BashTool } from './tools/BashTool/BashTool.js'
import { AgentTool } from './tools/AgentTool/AgentTool.js'
import { SkillTool } from './tools/SkillTool/SkillTool.js'

// 特性工具条件导入
const REPLTool = process.env.USER_TYPE === 'ant' 
  ? require('./tools/REPLTool/REPLTool.js').REPLTool 
  : null

const cronTools = feature('AGENT_TRIGGERS')
  ? [
      require('./tools/ScheduleCronTool/CronCreateTool.js').CronCreateTool,
      require('./tools/ScheduleCronTool/CronDeleteTool.js').CronDeleteTool,
      require('./tools/ScheduleCronTool/CronListTool.js').CronListTool,
    ]
  : []
```

## Feature Flag系统

### 实现原理

使用Bun的bundle特性进行dead code elimination:

```typescript
// bun:bundle 是Bun内置模块
import { feature } from 'bun:bundle'

// feature()在构建时静态求值
// 未使用的分支会被完全移除
const tool = feature('MY_FEATURE')
  ? require('./feature.ts').Class
  : null
```

### 使用场景

| Flag | 用途 |
|------|------|
| `ANT_ONLY` | 仅Anthropic内部功能 |
| `PROACTIVE` | 主动建议功能 |
| `KAIROS` | KAIROS特性 |
| `BRIDGE_MODE` | 远程桥接模式 |
| `VOICE_MODE` | 语音模式 |
| `AGENT_TRIGGERS` | 定时任务触发器 |
| `UDS_INBOX` | 进程间通信 |

## 权限系统

### 权限模式

```typescript
export type PermissionMode = 
  | 'default'           // 交互式确认
  | 'bypassPermissions' // 完全信任，跳过确认
  | 'alwaysAsk'         // 始终询问
```

### 权限规则

```typescript
export type ToolPermissionRulesBySource = {
  [source: string]: {
    tools: string[]
    action: 'allow' | 'deny' | 'ask'
  }
}

// 示例规则
const rules: ToolPermissionRulesBySource = {
  'workspace:/project': {
    tools: ['Bash', 'Write'],
    action: 'allow'
  },
  'workspace:/tmp': {
    tools: ['Bash'],
    action: 'ask'
  }
}
```

## MCP (Model Context Protocol)

### 客户端架构

```typescript
// services/mcp/index.ts
export class MCPClient {
  private connections: Map<string, MCPServerConnection>
  private tools: Map<string, MCPTool>
  
  async connect(serverId: string, config: MCPServerConfig): Promise<void>
  async disconnect(serverId: string): Promise<void>
  async listTools(): Promise<MCPTool[]>
  async callTool(name: string, args: any): Promise<ToolResult>
}
```

### 工具调用流程

```
User Request → QueryEngine → MCPClient → Server → Response
                    ↓
              ToolPermissionContext
                    ↓
              MCPClient.callTool()
```

## 多智能体Swarm

### 架构图

```
┌─────────────────────────────────────────────────┐
│                 Leader Agent                      │
│  (权限管理、任务协调、进度追踪)                    │
└─────────────────┬───────────────────────────────┘
                  │ 消息传递
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
┌───────┐   ┌───────┐   ┌───────┐
│Agent A│   │Agent B│   │Agent C│
│(开发)  │   │(测试)  │   │(文档)  │
└───────┘   └───────┘   └───────┘
```

### 关键文件

| 文件 | 职责 |
|------|------|
| `teammateInit.ts` | Teammate初始化 |
| `teammateModel.ts` | 模型配置 |
| `teammateLayoutManager.ts` | 布局管理 |
| `leaderPermissionBridge.ts` | 权限桥接 |
| `spawnInProcess.ts` | 进程启动 |

## 记忆系统

### MEMORY.md处理

```typescript
// memdir.ts
const MAX_ENTRYPOINT_LINES = 200
const MAX_ENTRYPOINT_BYTES = 25_000

export function truncateEntrypointContent(raw: string): EntrypointTruncation {
  const trimmed = raw.trim()
  const lines = trimmed.split('\n')
  
  let content = trimmed
  let wasLineTruncated = false
  let wasByteTruncated = false
  
  // 行数截断
  if (lines.length > MAX_ENTRYPOINT_LINES) {
    content = lines.slice(0, MAX_ENTRYPOINT_LINES).join('\n')
    wasLineTruncated = true
  }
  
  // 字节截断
  if (content.length > MAX_ENTRYPOINT_BYTES) {
    content = content.slice(0, MAX_ENTRYPOINT_BYTES)
    wasByteTruncated = true
  }
  
  return { content, wasLineTruncated, wasByteTruncated }
}
```

### 上下文构建

```typescript
export function buildMemoryPrompt(): string {
  const memoryFiles = getMemoryFiles()
  const truncated = memoryFiles.map(f => ({
    name: f.name,
    content: truncateEntrypointContent(f.content)
  }))
  
  return truncated.map(f => 
    `## ${f.name}\n\n${f.content.content}`
  ).join('\n\n')
}
```

## 任务系统

### 任务状态机

```
┌─────────┐    create    ┌──────────┐
│  NONE   │ ──────────→  │ ACTIVE   │
└─────────┘              └────┬─────┘
                             │
          ┌───────────────────┼───────────────────┐
          ↓                   ↓                   ↓
      ┌───────┐          ┌────────┐         ┌────────┐
      │COMPLETE│          │ WAITING │         │ FAILED │
      └───────┘          └────────┘         └────────┘
                             │
                             └──────────→ (等待依赖完成)
```

### 任务类型

```typescript
export type Task = {
  id: string
  name: string
  description?: string
  status: 'active' | 'complete' | 'waiting' | 'failed'
  dependencies: string[]
  output?: TaskOutput
  agentId?: string
}
```
