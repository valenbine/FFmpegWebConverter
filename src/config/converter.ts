export const SUPPORTED_FORMATS = {
  video: [
    { value: 'mp4', label: 'MP4', description: '最常用视频格式', icon: '🎬' },
    { value: 'webm', label: 'WebM', description: 'Web 优化格式', icon: '🌐' },
    { value: 'avi', label: 'AVI', description: 'Windows 通用格式', icon: '💻' },
    { value: 'mov', label: 'MOV', description: 'Apple 设备格式', icon: '🍎' },
    { value: 'mkv', label: 'MKV', description: '高清视频容器', icon: '📦' },
    { value: 'gif', label: 'GIF', description: '动态图片', icon: '🎞️' }
  ],
  audio: [
    { value: 'mp3', label: 'MP3', description: '最常用音频', icon: '🎵' },
    { value: 'm4a', label: 'M4A', description: 'Apple 音频格式', icon: '🎧' },
    { value: 'aac', label: 'AAC', description: '高质量音频', icon: '🔊' },
    { value: 'wav', label: 'WAV', description: '无损音频', icon: '💿' },
    { value: 'ogg', label: 'OGG', description: '开源音频格式', icon: '🎼' },
    { value: 'flac', label: 'FLAC', description: '无损压缩音频', icon: '🎹' }
  ]
}

export const QUALITY_PRESETS = [
  { value: 'ultrafast', label: '超快速', crf: '28' },
  { value: 'fast', label: '快速', crf: '23' },
  { value: 'medium', label: '中等', crf: '18' },
  { value: 'slow', label: '慢速（高质量）', crf: '15' }
]

export const getCommandLine = (inputFile: string, outputFile: string, format: string, quality: string) => {
  const preset = QUALITY_PRESETS.find(p => p.value === quality) || QUALITY_PRESETS[1]
  
  if (['mp3', 'aac', 'wav', 'ogg', 'flac'].includes(format)) {
    // 音频转换
    return ['-i', inputFile, '-c:a', format === 'mp3' ? 'libmp3lame' : format, '-b:a', '192k', outputFile]
  } else if (format === 'gif') {
    // GIF 转换
    return ['-i', inputFile, '-vf', 'fps=10,scale=480:-1', outputFile]
  } else {
    // 视频转换
    return [
      '-i', inputFile,
      '-c:v', 'libx264',
      '-preset', quality,
      '-crf', preset.crf,
      '-c:a', 'aac',
      '-b:a', '128k',
      outputFile
    ]
  }
}
