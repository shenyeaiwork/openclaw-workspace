---
name: Web Search
description: 使用 DuckDuckGo Lite 进行全网搜索，无需 API Key，直接获取真实搜索结果
metadata: {"emoji":"🔍"}
allowed-tools: web_fetch
---

# 全网搜索技能 (Web Search)

使用 web_fetch 工具通过 DuckDuckGo Lite 获取真实全网搜索结果。

## 使用方式

搜索关键词：
```
搜索: 你的关键词
```

例如：`搜索: iPhone 15 评测`

## 实现原理

- 使用 DuckDuckGo Lite (lite.duckduckgo.com) 获取搜索结果
- 纯 HTML 返回，无需 JavaScript 渲染
- 无需 API Key，完全免费

## 输出格式

返回搜索结果列表，包含：
- 标题
- 链接
- 描述/摘要

## 示例

输入：`搜索: ChatGPT 最新消息`

返回结果示例：
1. **ChatGPT - Wikipedia** - en.wikipedia.org - ChatGPT 是由 OpenAI 开发的人工智能聊天机器人...
2. **ChatGPT Official** - openai.com - ChatGPT 是 OpenAI 训练的大语言模型...
3. ...
