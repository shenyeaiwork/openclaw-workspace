#!/usr/bin/env python3
"""
语音识别模块
使用 OpenAI Whisper API 或本地识别
"""

import os
import sys
import requests
import json

# 可以使用 OpenAI Whisper API
# 或使用免费的语音识别服务

def transcribe_with_api(audio_path: str, api_key: str = None) -> str:
    """
    使用 OpenAI Whisper API 识别
    """
    if not api_key:
        return "需要设置 OpenAI API Key"
    
    try:
        with open(audio_path, "rb") as f:
            files = {"file": f}
            headers = {"Authorization": f"Bearer {api_key}"}
            data = {"model": "whisper-1", "language": "zh"}
            
            response = requests.post(
                "https://api.openai.com/v1/audio/transcriptions",
                files=files,
                data=data,
                headers=headers,
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json().get("text", "识别失败")
            else:
                return f"API错误: {response.status_code}"
    except Exception as e:
        return f"识别失败: {e}"


def transcribe_with_faster_whisper(audio_path: str) -> str:
    """
    使用 Faster Whisper (本地识别，更快)
    """
    try:
        from faster_whisper import WhisperModel
        
        model = WhisperModel("base", device="cpu", compute_type="int8")
        segments, info = model.transcribe(audio_path, language="zh")
        
        text = ""
        for segment in segments:
            text += segment.text
        
        return text.strip() if text else "未能识别出文字"
    except ImportError:
        return "请安装 faster-whisper: pip install faster-whisper"
    except Exception as e:
        return f"识别失败: {e}"


def transcribe_audio(audio_path: str) -> str:
    """
    主识别函数
    """
    if not os.path.exists(audio_path):
        return "音频文件不存在"
    
    # 先尝试本地识别
    result = transcribe_with_faster_whisper(audio_path)
    
    # 如果本地识别失败，返回提示
    if "请安装" in result or "失败" in result:
        # 可以在这里添加 API 识别作为备选
        pass
    
    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    print(f"正在识别: {audio_file}")
    
    result = transcribe_audio(audio_file)
    print(result)
