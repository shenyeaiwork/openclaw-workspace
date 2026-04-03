# Skills 目录结构

> 整理时间: 2026-04-04

## 📁 当前结构

```
skkills/
├── agent-bus/              # 🔧 核心 - Agent间通信
├── agent-browser/          # 🔧 核心 - 浏览器自动化
├── memory-search/          # 🔧 核心 - 记忆搜索
├── model-router-premium/   # 🔧 核心 - AI模型路由
├── session-context/        # 🔧 核心 - 会话上下文
│
├── claude-code-patterns/   # 💡 可选 - Claude Code架构参考
├── install-opend/          # 💡 可选 - OpenD安装
├── openapi/                # 💡 可选 - 富途交易API
├── web-search/             # 💡 可选 - 网页搜索
├── openai-whisper/         # 💡 可选 - 语音识别
│
├── softaworks-agent-toolkit/ # 🔬 实验 - Agent工具包
├── ship-learn-next/        # 🔬 实验 - 学习框架
└── audio-recognition/      # 🔬 实验 - 音频识别
```

## 📊 分类说明

| 分类 | 标记 | 说明 |
|------|------|------|
| 核心 | 🔧 | 必须启用，系统基础功能 |
| 可选 | 💡 | 按需启用，丰富能力 |
| 实验 | 🔬 | 正在测试，谨慎使用 |
| 归档 | 📦 | 已停用，保留参考 |

## 🔄 调整规则

1. 新skill默认放"可选"
2. 稳定后升级到"核心"
3. 废弃skill移到 archive/
4. 不需要的skill直接删除

## 📝 添加新Skill

1. 确定分类
2. 创建目录并编写 SKILL.md
3. 测试可用性
4. 通知用户更新
