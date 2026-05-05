export const SUPPORTED_FORMATS = {
  video: [
    { value: 'mp4', label: 'MP4', description: '最常用视频格式', icon: '🎬' },
    { value: 'webm', label: 'WebM', description: 'Web 优化格式', icon: '🌐' },
    { value: 'avi', label: 'AVI', description: 'Windows 通用格式', icon: '💻' },
    { value: 'mov', label: 'MOV', description: 'Apple 设备格式', icon: '🍎' },
    { value: 'mkv', label: 'MKV', description: '高清视频容器', icon: '📦' },
    { value: 'gif', label: 'GIF', description: '动态图片', icon: '🎞️' },
    { value: 'webp', label: 'WebP', description: '现代动态图片', icon: '🖼️' },
    { value: 'wmv', label: 'WMV', description: 'Windows 媒体视频', icon: '🪟' },
    { value: 'flv', label: 'FLV', description: 'Flash 视频', icon: '📹' },
    { value: '3gp', label: '3GP', description: '移动设备格式', icon: '📱' },
    { value: 'mpeg', label: 'MPEG', description: 'DVD 标准格式', icon: '💿' },
    { value: 'ts', label: 'TS', description: '高清传输流', icon: '📡' }
  ],
  audio: [
    { value: 'mp3', label: 'MP3', description: '最常用音频', icon: '🎵' },
    { value: 'm4a', label: 'M4A', description: 'Apple 音频格式', icon: '🎧' },
    { value: 'aac', label: 'AAC', description: '高质量音频', icon: '🔊' },
    { value: 'wav', label: 'WAV', description: '无损音频', icon: '💿' },
    { value: 'ogg', label: 'OGG', description: '开源音频格式', icon: '🎼' },
    { value: 'flac', label: 'FLAC', description: '无损压缩音频', icon: '🎹' },
    { value: 'opus', label: 'Opus', description: '高质量开源音频', icon: '🎙️' },
    { value: 'alac', label: 'ALAC', description: 'Apple 无损音频', icon: '🍎' },
    { value: 'aiff', label: 'AIFF', description: '专业无损音频', icon: '🎚️' },
    { value: 'wma', label: 'WMA', description: 'Windows 媒体音频', icon: '📻' }
  ]
}

export const QUALITY_PRESETS = [
  { value: 'ultrafast', label: '超快速', crf: '28' },
  { value: 'fast', label: '快速', crf: '23' },
  { value: 'medium', label: '中等', crf: '18' },
  { value: 'slow', label: '慢速（高质量）', crf: '15' }
]

export const VIDEO_CODECS: Record<string, string> = {
  mp4: 'libx264',
  webm: 'libvpx-vp9',
  avi: 'mpeg4',
  mov: 'libx264',
  mkv: 'libx264',
  wmv: 'wmv1',
  flv: 'flv',
  '3gp': 'mpeg4',
  mpeg: 'mpeg2video',
  ts: 'libx264',
  webp: 'libwebp_anim',
  gif: 'gif'
}

export const AUDIO_CODECS: Record<string, string> = {
  mp3: 'libmp3lame',
  m4a: 'aac',
  aac: 'aac',
  wav: 'pcm_s16le',
  ogg: 'libvorbis',
  flac: 'flac',
  opus: 'libopus',
  alac: 'alac',
  aiff: 'pcm_s16le',
  wma: 'wmav2'
}

export const AUDIO_BITRATES: Record<string, string> = {
  mp3: '192k',
  m4a: '192k',
  aac: '192k',
  wav: '',
  ogg: '192k',
  flac: '',
  opus: '128k',
  alac: '',
  aiff: '',
  wma: '192k'
}

export const getCommandLine = (inputFile: string, outputFile: string, format: string, quality: string): string[] => {
  const preset = QUALITY_PRESETS.find(p => p.value === quality) || QUALITY_PRESETS[1]
  const args: string[] = ['-i', inputFile]
  
  // 视频格式
  if (['mp4', 'webm', 'avi', 'mov', 'mkv', 'wmv', 'flv', '3gp', 'mpeg', 'ts'].includes(format)) {
    const codec = VIDEO_CODECS[format] || 'libx264'
    args.push('-c:v', codec)
    
    // MPEG-2 特殊处理
    if (format === 'mpeg') {
      args.push('-b:v', '5000k', '-c:a', 'mp2', '-b:a', '192k')
    } 
    // TS 流特殊处理
    else if (format === 'ts') {
      args.push('-bsf:v', 'h264_mp4toannexb', '-c:a', 'aac', '-b:a', '128k')
    }
    // WebM VP9 特殊处理
    else if (format === 'webm') {
      args.push('-crf', preset.crf, '-b:v', '0', '-c:a', 'libvorbis', '-b:a', '128k')
    }
    // 其他格式通用处理
    else {
      args.push(
        '-preset', quality,
        '-crf', preset.crf,
        '-c:a', 'aac',
        '-b:a', '128k'
      )
    }
  }
  // 动图格式
  else if (format === 'gif' || format === 'webp') {
    if (format === 'gif') {
      args.push('-vf', 'fps=10,scale=480:-1')
    } else {
      args.push('-vf', 'fps=10,scale=480:-1', '-loop', '0')
    }
  }
  // 音频格式
  else if (['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac', 'opus', 'alac', 'aiff', 'wma'].includes(format)) {
    const codec = AUDIO_CODECS[format] || 'aac'
    const bitrate = AUDIO_BITRATES[format]
    
    // Audio outputs should never carry a video stream.
    args.push('-vn')
    args.push('-c:a', codec)
    if (bitrate) {
      args.push('-b:a', bitrate)
    }
  }
  
  args.push(outputFile)
  return args
}

// 获取支持的格式列表（用于验证）
export const getSupportedFormats = () => {
  return {
    video: SUPPORTED_FORMATS.video.map(f => f.value),
    audio: SUPPORTED_FORMATS.audio.map(f => f.value),
    all: [...SUPPORTED_FORMATS.video.map(f => f.value), ...SUPPORTED_FORMATS.audio.map(f => f.value)]
  }
}
