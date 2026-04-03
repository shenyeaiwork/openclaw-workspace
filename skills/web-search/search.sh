#!/bin/bash
# Web Search Script - 使用 Agent Browser 进行全网搜索

QUERY="$1"
COUNT="${2:-10}"

if [ -z "$QUERY" ]; then
  echo "用法: $0 <搜索关键词> [结果数量]"
  exit 1
fi

# 临时文件
RESULTS_FILE=$(mktemp)

# 搜索函数
do_search() {
  echo "正在搜索: $QUERY"
  
  # 打开 Google 搜索
  agent-browser open "https://www.google.com/search?q=$(echo "$QUERY" | urlencode)&hl=zh-CN" 2>/dev/null
  
  # 等待页面加载
  agent-browser wait --load networkidle 2>/dev/null
  
  # 提取搜索结果 - 使用 JavaScript 获取结果
  agent-browser eval "
    (function() {
      const results = [];
      const items = document.querySelectorAll('div.g');
      items.forEach((item, index) => {
        if (index >= $COUNT) return;
        const titleEl = item.querySelector('h3');
        const linkEl = item.querySelector('a');
        const descEl = item.querySelector('div.VwiC3b');
        if (titleEl && linkEl) {
          results.push({
            title: titleEl.textContent,
            url: linkEl.href,
            description: descEl ? descEl.textContent : ''
          });
        }
      });
      return JSON.stringify(results);
    })()
  " > "$RESULTS_FILE"
  
  # 关闭浏览器
  agent-browser close 2>/dev/null
}

# 执行搜索并处理结果
do_search

# 输出结果
if [ -s "$RESULTS_FILE" ]; then
  cat "$RESULTS_FILE"
else
  echo "[]"
fi

# 清理
rm -f "$RESULTS_FILE"
