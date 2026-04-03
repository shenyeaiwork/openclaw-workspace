# 语音识别技能 🎙️

将语音消息转换为文字。

## 安装依赖

```bash
# 安装语音识别库 (后台运行中)
pip install faster-whisper
```

## 使用方法

当用户发送语音消息时：
1. 识别音频文件路径
2. 运行语音识别
3. 返回文字内容

## 识别命令

```bash
# 命令行识别
python ~/.openclaw/workspace/skills/audio-recognition/audio_recognize.py <音频文件路径>
```

## 支持格式

- OGG (Opus)
- WAV
- MP3
- M4A

## 注意事项

- 音频文件需小于 10MB
- 首次使用需要安装依赖
- 中文识别效果较好

## 文件位置

- 脚本: `~/.openclaw/workspace/skills/audio-recognition/audio_recognize.py`
- 依赖安装中，请稍候...
