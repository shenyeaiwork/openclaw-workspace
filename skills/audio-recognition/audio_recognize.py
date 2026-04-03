#!/usr/bin/env python3
"""
语音识别模块
使用 Faster Whisper 进行本地语音识别
"""

import os
import sys

def transcribe_audio(audio_path: str) -> str:
    """
    使用 Faster Whisper 识别语音
    """
    if not os.path.exists(audio_path):
        return "音频文件不存在"
    
    try:
        from faster_whisper import WhisperModel
        
        print("加载模型...")
        # 使用 base 模型，约 140MB
        model = WhisperModel("base", device="cpu", compute_type="int8")
        
        print("正在识别...")
        # 识别中文
        segments, info = model.transcribe(audio_path, language="zh")
        
        print(f"检测到语言: {info.language} (概率: {info.language_probability:.2f})")
        
        text = ""
        for segment in segments:
            text += segment.text
        
        return text.strip() if text else "未能识别出文字"
        
    except ImportError:
        return "请安装 faster-whisper: pip install faster-whisper"
    except Exception as e:
        return f"识别失败: {e}"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python audio_recognize.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    print(f"正在识别: {audio_file}")
    
    result = transcribe_audio(audio_file)
    print(result)
