import { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'
import FileUpload from './components/FileUpload'
import ConverterOptions from './components/ConverterOptions'
import Progress from './components/Progress'
import './App.css'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [outputURL, setOutputURL] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState('mp4')
  const [quality, setQuality] = useState('medium')
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video')
  const [inputMediaType, setInputMediaType] = useState<'video' | 'audio'>('video')
  const [error, setError] = useState('')

  const ffmpegRef = useRef(new FFmpeg())

  useEffect(() => {
    loadFFmpeg()
  }, [])

  const loadFFmpeg = async () => {
    setLoading(true)
    const ffmpeg = ffmpegRef.current

    ffmpeg.on('log', ({ message }) => {
      console.log(message)
      setMessage(message)
    })

    ffmpeg.on('progress', ({ progress }) => {
      setProgress(progress)
    })

    try {
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm'
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      })

      setLoaded(true)
      setLoadingProgress(100)
    } catch (error) {
      console.error('Error loading FFmpeg:', error)
      setError('加载 FFmpeg 失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError('')
    setOutputURL('')
    setProgress(0)
    
    // 自动检测媒体类型
    if (file.type.startsWith('audio/')) {
      setInputMediaType('audio')
      setMediaType('audio')
      setOutputFormat('mp3')
    } else if (file.type.startsWith('video/')) {
      setInputMediaType('video')
      setMediaType('video')
      setOutputFormat('mp4')
    }
  }

  const convertVideo = async () => {
    if (!selectedFile || !loaded) return

    setIsConverting(true)
    setProgress(0)
    setOutputURL('')
    setError('')

    const ffmpeg = ffmpegRef.current
    const inputFile = `input_${Date.now()}_${selectedFile.name}`
    const extension = outputFormat
    const outputFile = `output_${Date.now()}.${extension}`

    try {
      setMessage('正在写入文件...')
      await ffmpeg.writeFile(inputFile, await fetchFile(selectedFile))

      setMessage('正在转换...')
      
      // 构建 FFmpeg 命令
      const args = ['-i', inputFile]
      
      // 视频转音频
      if (inputMediaType === 'video' && ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac'].includes(outputFormat)) {
        if (outputFormat === 'mp3') {
          args.push('-vn', '-c:a', 'libmp3lame', '-b:a', '192k')
        } else if (outputFormat === 'm4a') {
          args.push('-vn', '-c:a', 'aac', '-b:a', '192k')
        } else if (outputFormat === 'aac') {
          args.push('-vn', '-c:a', 'aac', '-b:a', '192k')
        } else if (outputFormat === 'wav') {
          args.push('-vn', '-c:a', 'pcm_s16le')
        } else if (outputFormat === 'ogg') {
          args.push('-vn', '-c:a', 'libvorbis', '-b:a', '192k')
        } else if (outputFormat === 'flac') {
          args.push('-vn', '-c:a', 'flac')
        }
      }
      // 音频转音频
      else if (inputMediaType === 'audio' && ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac'].includes(outputFormat)) {
        if (outputFormat === 'mp3') {
          args.push('-c:a', 'libmp3lame', '-b:a', '192k')
        } else if (outputFormat === 'm4a' || outputFormat === 'aac') {
          args.push('-c:a', 'aac', '-b:a', '192k')
        } else if (outputFormat === 'wav') {
          args.push('-c:a', 'pcm_s16le')
        } else if (outputFormat === 'ogg') {
          args.push('-c:a', 'libvorbis', '-b:a', '192k')
        } else if (outputFormat === 'flac') {
          args.push('-c:a', 'flac')
        }
      }
      // 视频转视频
      else if (outputFormat === 'gif') {
        args.push('-vf', 'fps=10,scale=480:-1')
      } else {
        // 视频转码
        const qualityMap: Record<string, string> = {
          ultrafast: '28',
          fast: '23',
          medium: '18',
          slow: '15'
        }
        args.push(
          '-c:v', 'libx264',
          '-preset', quality,
          '-crf', qualityMap[quality] || '18',
          '-c:a', 'aac',
          '-b:a', '128k'
        )
      }
      
      args.push(outputFile)
      
      await ffmpeg.exec(args)

      setMessage('正在生成输出文件...')
      const data = await ffmpeg.readFile(outputFile)
      
      const mimeType = outputFormat === 'mp4' || outputFormat === 'webm' || outputFormat === 'mov' || outputFormat === 'avi' || outputFormat === 'mkv'
        ? 'video/' + outputFormat
        : outputFormat === 'mp3' || outputFormat === 'wav' || outputFormat === 'm4a' || outputFormat === 'ogg' || outputFormat === 'flac' || outputFormat === 'aac'
          ? 'audio/' + outputFormat
          : outputFormat === 'gif' ? 'image/gif' : 'application/octet-stream'
      
      const blob = new Blob([data], { type: mimeType })
      const url = URL.createObjectURL(blob)

      setOutputURL(url)
      setMessage('转换完成!')
      
      // 清理临时文件
      await ffmpeg.deleteFile(inputFile)
      await ffmpeg.deleteFile(outputFile)
    } catch (error: any) {
      console.error('Conversion error:', error)
      setError(`转换失败：${error.message}`)
    } finally {
      setIsConverting(false)
    }
  }

  const downloadFile = () => {
    if (!outputURL) return
    
    const a = document.createElement('a')
    a.href = outputURL
    const ext = outputFormat === 'gif' ? 'gif' : outputFormat
    a.download = `converted_${Date.now()}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-container">
          <h1>🎬 FFmpeg Web Converter</h1>
          <p>正在加载 FFmpeg 核心组件...</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${loadingProgress}%` }} />
          </div>
          <p className="loading-hint">首次加载需要下载约 30MB 文件，请耐心等待</p>
        </div>
      </div>
    )
  }

  if (error && !loaded) {
    return (
      <div className="app error">
        <div className="error-container">
          <h1>❌ 加载失败</h1>
          <p>{error}</p>
          <button onClick={loadFFmpeg} className="retry-btn">重试</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🎬 FFmpeg Web Converter</h1>
          <p className="subtitle">基于 WebAssembly 的在线音视频格式转换工具</p>
        </header>

        <main className="main-content">
          <FileUpload onFileSelect={handleFileSelect} />

          {selectedFile && (
            <>
              <div className="media-info">
                <span className={`media-badge ${inputMediaType}`}>
                  {inputMediaType === 'video' ? '🎬 视频文件' : '🎵 音频文件'}
                </span>
                <span className="arrow">→</span>
                <select
                  className="output-type-select"
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as 'video' | 'audio')}
                >
                  <option value="video">🎬 视频</option>
                  <option value="audio">🎵 音频</option>
                </select>
              </div>

              <ConverterOptions
                outputFormat={outputFormat}
                onFormatChange={setOutputFormat}
                quality={quality}
                onQualityChange={setQuality}
                mediaType={mediaType}
              />

              <div className="action-section">
                <button
                  className="convert-btn"
                  onClick={convertVideo}
                  disabled={isConverting || !loaded}
                >
                  {isConverting ? '转换中...' : '开始转换'}
                </button>
              </div>
            </>
          )}

          <Progress progress={progress} message={message} isConverting={isConverting} />

          {error && isConverting === false && error !== '加载 FFmpeg 失败，请刷新页面重试' && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {outputURL && (
            <div className="output-section">
              <h3>✅ 转换成功!</h3>
              {(mediaType === 'video' && outputFormat !== 'gif' && !['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac'].includes(outputFormat)) && (
                <video src={outputURL} controls />
              )}
              {['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac'].includes(outputFormat) && (
                <div className="audio-player-wrapper">
                  <audio src={outputURL} controls />
                </div>
              )}
              {outputFormat === 'gif' && (
                <img src={outputURL} alt="Converted GIF" className="gif-output" />
              )}
              <button className="download-btn" onClick={downloadFile}>
                ⬇️ 下载文件
              </button>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>基于 <a href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noopener noreferrer">FFmpeg.wasm</a> 构建</p>
          <p className="privacy-hint">所有处理都在本地浏览器完成，文件不会上传到服务器</p>
        </footer>
      </div>
    </div>
  )
}

export default App
