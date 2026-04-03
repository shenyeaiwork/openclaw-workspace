# SKILL.md - 记忆搜索

激活条件：用户问"记得..."、"之前聊过..."、"搜索记忆"等

## 功能

调用超长记忆系统搜索历史记忆。

## 调用方式

```bash
curl -s -X POST "http://localhost:8090/api/search" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"查询内容\"}"
```

## 返回格式

```json
{
  "layer": "short-term|long-term",
  "results": [
    {"source": "文件名", "text": "内容", "score": 0.9}
  ],
  "queryTime": 10
}
```

## 使用场景

- 用户问"记得我之前..."
- 用户问"之前我们聊过..."
- 需要查找历史上下文时

## 注意

- 短期记忆: 直接查文件，0ms
- 长期记忆: 需要加载 Embedding 模型，首次 ~10s，后续 ~100ms
- 结果按相关性排序
