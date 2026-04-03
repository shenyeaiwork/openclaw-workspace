# MCP (Model Context Protocol) 协议说明

## 概述

MCP是一个开放协议，用于将AI模型与外部工具、数据源和系统连接。它是Anthropic推出的标准，旨在创建可复用的AI工具集成。

## Claude Code中的MCP实现

### 源码位置
- 客户端: `src/services/mcp/`
- 工具: `src/tools/MCPTool/`
- 资源: `src/tools/ListMcpResourcesTool/`, `src/tools/ReadMcpResourceTool/`

### 核心组件

```
src/services/mcp/
├── index.ts              # MCPClient主类
├── types.ts              # 类型定义
├── typescript.ts         # TS工具类型
├── prompt.ts             # 提示词处理
├── auth.ts               # 认证处理
└── utils.ts              # 工具函数
```

## MCP服务器配置

### 配置结构

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"],
      "env": {
        "API_KEY": "xxx"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "xxx"
      }
    }
  }
}
```

### 认证方式

```typescript
// anonymous - 无认证
{ "command": "npx", "args": ["-y", "some-server"] }

// apiKey - API密钥
{ 
  "command": "npx", 
  "args": ["-y", "server"],
  "env": { "API_KEY": "xxx" }
}

// oauth - OAuth认证
{
  "command": "npx",
  "args": ["-y", "server"],
  "auth": {
    "type": "oauth",
    "clientId": "xxx",
    "clientSecret": "xxx",
    "redirectUri": "http://localhost:8090/callback"
  }
}
```

## MCP工具定义

### 工具schema

```typescript
interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}
```

### 调用流程

```
Claude Code → MCPClient → MCP Server
                            ↓
                      Execute Tool
                            ↓
                      JSON-RPC Response
                            ↓
                    MCPClient → Claude Code
```

## MCP资源

### 资源定义

```typescript
interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
}
```

### 资源访问

```typescript
// 列出资源
const resources = await mcpClient.listResources(serverId)

// 读取资源
const content = await mcpClient.readResource(serverId, resourceUri)
```

## MCP提示词模板

### Prompt模板

```typescript
interface MCPPrompt {
  name: string
  description?: string
  arguments?: {
    name: string
    description?: string
    required?: boolean
  }[]
}
```

### 调用提示词

```typescript
const result = await mcpClient.getPrompt(
  serverId,
  promptName,
  { arg1: 'value' }
)
```

## Claude Code中的MCP集成

### 工具桥接

```typescript
// src/tools/MCPTool/MCPTool.ts
export class MCPTool implements Tool {
  name = 'MCP'
  
  async handler(args: { server: string; tool: string; params?: any }) {
    const client = this.mcpClientRegistry.getClient(args.server)
    return await client.callTool(args.tool, args.params)
  }
}
```

### 权限控制

```typescript
// MCP工具权限检查
function checkMCPPermission(
  context: ToolPermissionContext,
  server: string,
  tool: string
): boolean {
  // 检查服务器是否在白名单
  if (!context.mcpServers?.includes(server)) {
    return false
  }
  
  // 检查工具权限
  return context.alwaysAllowRules[`mcp:${server}:${tool}`] ?? true
}
```

## 内置MCP服务器

### 文件系统服务器

```bash
npx -y @modelcontextprotocol/server-filesystem /path/to/dir
```

提供的能力:
- `read_file` - 读取文件
- `read_directory` - 读取目录
- `list_directory` - 列出目录
- `create_directory` - 创建目录
- `move_file` - 移动文件
- `search_files` - 搜索文件
- `write_file` - 写入文件
- `get_file_info` - 获取文件信息

### GitHub服务器

```bash
npx -y @modelcontextprotocol/server-github
```

需要环境变量:
- `GITHUB_TOKEN` - GitHub个人访问令牌

提供的能力:
- `search_repositories` - 搜索仓库
- `get_repository` - 获取仓库信息
- `list_issues` - 列出Issue
- `create_issue` - 创建Issue
- `list_pulls` - 列出PR
- `create_pull` - 创建PR

### Slack服务器

```bash
npx -y @modelcontextprotocol/server-slack
```

需要环境变量:
- `SLACK_BOT_TOKEN` - Slack Bot Token
- `SLACK_TEAM_ID` - Slack Team ID

提供的能力:
- `channels_list` - 列出频道
- `channels_history` - 获取频道历史
- `chat_postMessage` - 发送消息

## 自定义MCP服务器

### 使用Python SDK

```python
from mcp.server import MCPServer
from mcp.types import Tool

server = MCPServer("my-server")

@server.tool()
def calculate(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

if __name__ == "__main__":
    server.run()
```

### 使用Node.js SDK

```typescript
import { MCPServer } from '@modelcontextprotocol/sdk'

const server = new MCPServer({
  name: 'my-server',
  version: '1.0.0'
})

server.tool('calculate', {
  description: 'Add two numbers',
  inputSchema: {
    type: 'object',
    properties: {
      a: { type: 'integer' },
      b: { type: 'integer' }
    }
  }
}, async ({ a, b }) => {
  return { result: a + b }
})

server.run()
```

## 调试MCP

### 日志级别

```bash
# 启动详细日志
CLAUDE_MCP_LOG_LEVEL=debug claude

# 查看MCP通信
CLAUDE_MCP_LOG_LEVEL=trace claude
```

### 测试连接

```bash
# 检查MCP服务器状态
claude mcp list

# 重新加载MCP
claude mcp reload
```

## 最佳实践

1. **安全认证**: 使用环境变量而非硬编码密钥
2. **错误处理**: 总是处理超时和连接失败
3. **资源清理**: 使用完畢后关闭连接
4. **类型检查**: 使用JSON Schema验证输入
5. **日志记录**: 记录关键操作便于调试
