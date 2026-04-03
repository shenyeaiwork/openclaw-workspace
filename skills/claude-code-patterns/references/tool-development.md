# 工具开发指南

## 创建新工具

### 1. 工具模板

```typescript
// src/tools/MyTool/MyTool.ts
import type { Tool } from '../Tool.js'
import type { ToolPermissionContext } from '../types/permissions.js'
import type { ToolProgressData } from '../types/tools.js'

export const MY_TOOL_NAME = 'my-tool'

export class MyTool implements Tool {
  name = MY_TOOL_NAME
  description = '描述工具功能'
  
  inputSchema = {
    type: 'object',
    properties: {
      arg1: { type: 'string', description: '参数1' },
      arg2: { type: 'number', description: '参数2' }
    },
    required: ['arg1']
  }
  
  async handler(
    args: { arg1: string; arg2?: number },
    context: ToolPermissionContext,
    progress?: (update: ToolProgressData) => void
  ) {
    // 1. 权限检查
    if (!this.hasPermission(context, args)) {
      return { error: 'Permission denied' }
    }
    
    // 2. 进度报告
    progress?.({ type: 'start', message: '开始执行...' })
    
    // 3. 执行逻辑
    try {
      const result = await this.doWork(args, progress)
      
      // 4. 返回结果
      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  private hasPermission(context: ToolPermissionContext, args: any): boolean {
    // 检查权限规则
    return context.mode === 'bypassPermissions' || 
           context.alwaysAllowRules[MY_TOOL_NAME]
  }
  
  private async doWork(args: any, progress?: any): Promise<any> {
    progress?.({ type: 'progress', message: '处理中...', percent: 50 })
    // 具体实现
    return { result: 'done' }
  }
}
```

### 2. 在tools.ts中注册

```typescript
// src/tools.ts
import { MyTool } from './tools/MyTool/MyTool.js'

// 添加到导出
export const MY_TOOL_NAME = 'my-tool'

// 在allTools数组中添加
const allTools = [
  // ... 其他工具
  MyTool,
]
```

### 3. 特性工具条件注册

```typescript
// src/tools.ts
const MySpecialTool = feature('MY_FEATURE')
  ? require('./tools/MySpecialTool/MySpecialTool.js').MySpecialTool
  : null
```

## 工具类型参考

### 文件操作工具

| 工具 | 文件 | 功能 |
|------|------|------|
| FileReadTool | FileReadTool/FileReadTool.ts | 读取文件 |
| FileWriteTool | FileWriteTool/FileWriteTool.ts | 写入文件 |
| FileEditTool | FileEditTool/FileEditTool.ts | 编辑文件(-diff) |
| GlobTool | GlobTool/GlobTool.ts | Glob模式匹配 |
| GrepTool | GrepTool/GrepTool.ts | 文本搜索 |

### Shell工具

| 工具 | 文件 | 功能 |
|------|------|------|
| BashTool | BashTool/BashTool.ts | Bash命令执行 |
| PowerShellTool | PowerShellTool/PowerShellTool.ts | PowerShell执行 |

### Web工具

| 工具 | 文件 | 功能 |
|------|------|------|
| WebSearchTool | WebSearchTool/WebSearchTool.ts | 网络搜索 |
| WebFetchTool | WebFetchTool/WebFetchTool.ts | URL内容抓取 |

### AI工具

| 工具 | 文件 | 功能 |
|------|------|------|
| AgentTool | AgentTool/AgentTool.ts | 调用子Agent |
| SkillTool | SkillTool/SkillTool.ts | 调用Skill |
| TaskOutputTool | TaskOutputTool/TaskOutputTool.ts | 获取任务输出 |

### 任务工具

| 工具 | 文件 | 功能 |
|------|------|------|
| TaskCreateTool | TaskCreateTool/TaskCreateTool.ts | 创建任务 |
| TaskListTool | TaskListTool/TaskListTool.ts | 列出任务 |
| TaskGetTool | TaskGetTool/TaskGetTool.ts | 获取任务详情 |
| TaskUpdateTool | TaskUpdateTool/TaskUpdateTool.ts | 更新任务 |
| TaskStopTool | TaskStopTool/TaskStopTool.ts | 停止任务 |

### 团队协作工具

| 工具 | 文件 | 功能 |
|------|------|------|
| TeamCreateTool | TeamCreateTool/TeamCreateTool.ts | 创建团队 |
| TeamDeleteTool | TeamDeleteTool/TeamDeleteTool.ts | 删除团队 |
| SendMessageTool | SendMessageTool/SendMessageTool.ts | 发送消息 |

### 系统工具

| 工具 | 文件 | 功能 |
|------|------|------|
| ConfigTool | ConfigTool/ConfigTool.ts | 配置管理 |
| LSPTool | LSPTool/LSPTool.ts | 语言服务协议 |
| MCPTool | MCPTool/MCPTool.ts | MCP协议工具 |
| EnterPlanModeTool | EnterPlanModeTool/ | 进入计划模式 |

## 进度报告

```typescript
progress?.({
  type: 'start',
  message: '开始下载文件...'
})

progress?.({
  type: 'progress',
  message: '下载中...',
  percent: 50
})

progress?.({
  type: 'complete',
  message: '下载完成',
  result: { path: '/path/to/file' }
})

progress?.({
  type: 'error',
  message: '下载失败',
  error: 'Network error'
})
```

## 权限检查

```typescript
import { ALL_AGENT_DISALLOWED_TOOLS } from '../tools.js'

// 检查是否允许执行
function canUseTool(context: ToolPermissionContext, toolName: string): boolean {
  // 1. 检查禁用列表
  if (ALL_AGENT_DISALLOWED_TOOLS.includes(toolName)) {
    return false
  }
  
  // 2. 检查bypass模式
  if (context.mode === 'bypassPermissions') {
    return true
  }
  
  // 3. 检查alwaysAllow规则
  if (context.alwaysAllowRules[toolName]) {
    return true
  }
  
  // 4. 检查alwaysDeny规则
  if (context.alwaysDenyRules[toolName]) {
    return false
  }
  
  return true
}
```

## 工具结果格式

```typescript
// 成功结果
return {
  success: true,
  data: {
    // 结果数据
  },
  metadata: {
    // 可选元数据
    cost: 1000,
    duration: 500
  }
}

// 错误结果
return {
  success: false,
  error: '错误描述',
  code: 'ERROR_CODE'
}

// 空结果
return {
  success: true,
  data: null
}
```

## 测试工具

```typescript
// 创建测试上下文
const mockContext: ToolPermissionContext = {
  mode: 'bypassPermissions',
  additionalWorkingDirectories: new Map(),
  alwaysAllowRules: { [MY_TOOL_NAME]: true },
  alwaysDenyRules: {},
  alwaysAskRules: {},
  isBypassPermissionsModeAvailable: true
}

// 执行测试
const tool = new MyTool()
const result = await tool.handler(
  { arg1: 'test' },
  mockContext
)

console.assert(result.success === true)
```
