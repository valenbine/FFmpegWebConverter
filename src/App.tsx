import { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'
import FileUpload from './components/FileUpload'
import ConverterOptions from './components/ConverterOptions'
import Progress from './components/Progress'
import ErrorDetails from './components/ErrorDetails'
import { getCommandLine } from './config/converter'
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
  const [errorDetails, setErrorDetails] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const ffmpegRef = useRef(new FFmpeg())

  const addLog = (log: string) => {
    setLogs(prev => [...prev, log])
    console.log('[FFmpeg-Converter]', log)
  }

  useEffect(() => {
    loadFFmpeg()
  }, [])

  const loadFFmpeg = async () => {
    setLoading(true)
    const ffmpeg = ffmpegRef.current

    addLog('开始加载 FFmpeg 核心组件...')

    ffmpeg.on('log', ({ message: logMessage, type }) => {
      if (type === 'warning' || type === 'error') {
        addLog(`[${type.toUpperCase()}] ${logMessage}`)
      } else {
        addLog(logMessage)
      }
    })

    ffmpeg.on('progress', ({ progress, time }) => {
      setProgress(progress)
      addLog(`转换进度：${Math.round(progress * 100)}% (时间：${(time / 1000000).toFixed(1)}s)`)
      setMessage(`正在转换：${Math.round(progress * 100)}%`)
    })

    try {
      const supportsSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined'
      const localSingleThreadBaseURL = `${window.location.origin}/ffmpeg-core-st`
      const localMultiThreadBaseURL = `${window.location.origin}/ffmpeg-core-mt`
      const cdnSingleThreadBaseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd'
      const cdnMultiThreadBaseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm'

      addLog('正在下载 FFmpeg 核心文件（约 30MB）...')
      setLoadingProgress(30)
      addLog('运行平台：Web/Desktop')

      const probeLocalResource = async (url: string) => {
        const response = await fetch(url, { method: 'GET' })
        if (!response.ok) {
          throw new Error(`资源不可访问：${url} (${response.status})`)
        }
      }

      const loadSingleThreadCore = async (baseURL: string) => {
        await probeLocalResource(`${baseURL}/ffmpeg-core.js`)
        await probeLocalResource(`${baseURL}/ffmpeg-core.wasm`)
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
      }

      const loadMultiThreadCore = async (baseURL: string) => {
        await probeLocalResource(`${baseURL}/ffmpeg-core.js`)
        await probeLocalResource(`${baseURL}/ffmpeg-core.wasm`)
        await probeLocalResource(`${baseURL}/ffmpeg-core.worker.js`)
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        })
      }

      const loadSingleThreadCoreFromCDN = async (baseURL: string) => {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
      }

      const loadMultiThreadCoreFromCDN = async (baseURL: string) => {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        })
      }
      
      // 优先加载本地打包资源；不支持 SharedArrayBuffer 时自动降级到单线程核心。
      try {
        if (supportsSharedArrayBuffer) {
          addLog(`检测到 SharedArrayBuffer，优先加载多线程 FFmpeg core：${localMultiThreadBaseURL}`)
          await loadMultiThreadCore(localMultiThreadBaseURL)
        } else {
          addLog(`当前环境不支持 SharedArrayBuffer，切换到单线程 FFmpeg core：${localSingleThreadBaseURL}`)
          await loadSingleThreadCore(localSingleThreadBaseURL)
        }
      } catch (localError: any) {
        addLog(`⚠️ 本地 FFmpeg core 不可用：${localError?.message || localError}`)
        addLog('⚠️ 回退到 CDN 加载')
        if (supportsSharedArrayBuffer) {
          await loadMultiThreadCoreFromCDN(cdnMultiThreadBaseURL)
        } else {
          await loadSingleThreadCoreFromCDN(cdnSingleThreadBaseURL)
        }
      }

      if (supportsSharedArrayBuffer) {
        addLog('✅ 已启用多线程 FFmpeg core')
      } else {
        addLog('✅ 已启用单线程 FFmpeg core')
      }

      setLoaded(true)
      setLoadingProgress(100)
      addLog('✅ FFmpeg 核心加载成功！')
    } catch (error: any) {
      const errorMsg = `加载 FFmpeg 失败：${error.message}`
      addLog(`❌ ${errorMsg}`)
      setError(errorMsg)
      setErrorDetails(error?.stack?.toString() || JSON.stringify(error, null, 2))
      console.error('FFmpeg load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError('')
    setErrorDetails('')
    setOutputURL('')
    setProgress(0)
    setLogs([])
    
    addLog(`📁 选择文件：${file.name}`)
    addLog(`文件大小：${(file.size / 1024 / 1024).toFixed(2)} MB`)
    addLog(`文件类型：${file.type || '未知'}`)
    
    // 自动检测媒体类型
    if (file.type.startsWith('audio/')) {
      setInputMediaType('audio')
      setMediaType('audio')
      setOutputFormat('mp3')
      addLog('🎵 检测到音频文件')
    } else if (file.type.startsWith('video/')) {
      setInputMediaType('video')
      setMediaType('video')
      setOutputFormat('mp4')
      addLog('🎬 检测到视频文件')
    } else {
      addLog('⚠️ 未知文件类型，尝试按视频处理')
    }
  }

  const convertVideo = async () => {
    if (!selectedFile || !loaded) {
      const msg = '请先选择要转换的文件'
      addLog(`❌ ${msg}`)
      setError(msg)
      return
    }

    setIsConverting(true)
    setProgress(0)
    setOutputURL('')
    setError('')
    setErrorDetails('')
    setLogs([])

    const ffmpeg = ffmpegRef.current
    const inputFile = `input_${Date.now()}_${selectedFile.name}`
    const outputFile = `output_${Date.now()}.${outputFormat}`

    try {
      addLog('══════════════════════════════════════')
      addLog('🚀 开始转换')
      addLog(`输入文件：${inputFile}`)
      addLog(`输出文件：${outputFile}`)
      addLog(`目标格式：${outputFormat.toUpperCase()}`)
      addLog(`质量预设：${quality}`)
      addLog('执行平台：desktop')
      addLog('══════════════════════════════════════')

      setMessage('正在写入文件...')
      addLog('📝 正在写入输入文件到 FFmpeg 虚拟文件系统...')
      
      const fileData = await fetchFile(selectedFile)
      addLog(`✅ 文件读取完成，大小：${fileData.byteLength} bytes`)
      
      await ffmpeg.writeFile(inputFile, fileData)
      addLog('✅ 文件写入完成')

      setMessage(`正在转换：${outputFormat.toUpperCase()}...`)
      addLog('🔧 生成 FFmpeg 命令参数...')
      
      // 使用配置文件中的命令行生成器
      const args = getCommandLine(inputFile, outputFile, outputFormat, quality)
      addLog(`📋 FFmpeg 命令：ffmpeg ${args.join(' ')}`)
      
      try {
        addLog('▶️ 开始执行 FFmpeg 转换...')
        await ffmpeg.exec(args)
        addLog('✅ FFmpeg 转换执行成功')
      } catch (execError: any) {
        addLog(`❌ FFmpeg 执行错误：${execError.message || '未知错误'}`)
        throw execError
      }

      setMessage('正在生成输出文件...')
      addLog('📤 正在读取输出文件...')
      
      const data = await ffmpeg.readFile(outputFile)
      
      if (!data || data.length === 0) {
        throw new Error('转换后文件为空，可能转换失败')
      }
      
      addLog(`✅ 输出文件读取成功，大小：${data.length} bytes`)
      
      // 获取 MIME 类型
      const getMimeType = (format: string): string => {
        const videoFormats = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'wmv', 'flv', '3gp', 'mpeg', 'ts', 'webp']
        const audioFormats = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac', 'opus', 'alac', 'aiff', 'wma']
        const imageFormats = ['gif', 'webp']
        
        if (imageFormats.includes(format)) return 'image/' + format
        if (videoFormats.includes(format)) return 'video/' + format
        if (audioFormats.includes(format)) return 'audio/' + format
        return 'application/octet-stream'
      }
      
      const mimeType = getMimeType(outputFormat)
      addLog(`音频/视频 MIME 类型：${mimeType}`)
      
      const outputBytes = typeof data === 'string' ? new TextEncoder().encode(data) : Uint8Array.from(data)
      const blob = new Blob([outputBytes.buffer], { type: mimeType })
      const url = URL.createObjectURL(blob)

      setOutputURL(url)
      setMessage('✅ 转换完成!')
      addLog('🎉 转换成功！')
      addLog(`输出 URL：${URL.createObjectURL(blob).substring(0, 100)}...`)
      
      // 清理临时文件
      try {
        addLog('🗑️ 正在清理临时文件...')
        await ffmpeg.deleteFile(inputFile)
        await ffmpeg.deleteFile(outputFile)
        addLog('✅ 临时文件已清理')
      } catch (cleanupError) {
        addLog(`⚠️ 清理临时文件失败：${cleanupError}`)
      }
    } catch (error: any) {
      console.error('Conversion error:', error)
      const errorMessage = error?.message || error?.toString() || '未知错误'
      const errorStack = error?.stack?.toString() || ''
      
      const fullError = `转换失败：${errorMessage}`
      addLog(`❌ ${fullError}`)
      addLog(`技术详情：${errorStack || JSON.stringify(error, null, 2)}`)
      
      setError(fullError)
      setErrorDetails(errorStack || JSON.stringify(error, null, 2))
      setMessage('转换失败')
    } finally {
      setIsConverting(false)
      addLog('══════════════════════════════════════')
    }
  }

  const downloadFile = () => {
    if (!outputURL) return
    
    addLog('⬇️ 开始下载文件...')
    const a = document.createElement('a')
    a.href = outputURL
    const ext = outputFormat === 'gif' ? 'gif' : outputFormat
    a.download = `converted_${Date.now()}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    addLog('✅ 下载已开始')
  }

  const clearLogs = () => {
    setLogs([])
    addLog('🧹 日志已清空')
  }

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-container">
          <h1>🎬 FFmpeg Converter</h1>
          <p>正在加载 FFmpeg 核心组件...</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${loadingProgress}%` }} />
          </div>
          <p className="loading-hint">首次加载需要下载约 30MB 文件，请耐心等待</p>
          {logs.length > 0 && (
            <div className="mini-log-panel">
              {logs.slice(-3).map((log, i) => (
                <div key={i} className="mini-log-item">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error && !loaded) {
    return (
      <div className="app error">
        <div className="error-container">
          <h1>❌ 加载失败</h1>
          <ErrorDetails 
            error={error} 
            errorDetails={errorDetails} 
            onDismiss={() => {
              setError('')
              setErrorDetails('')
              loadFFmpeg()
            }}
          />
          <button onClick={loadFFmpeg} className="retry-btn">🔄 重试</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🎬 FFmpeg Converter</h1>
          <p className="subtitle">本地音视频格式转换工具（离线可用）</p>
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

          <Progress progress={progress} message={message} isConverting={isConverting} logs={logs} />

          {error && (
            <ErrorDetails 
              error={error} 
              errorDetails={errorDetails} 
              onDismiss={() => {
                setError('')
                setErrorDetails('')
              }}
            />
          )}

          {outputURL && (
            <div className="output-section">
              <h3>✅ 转换成功!</h3>
              {['gif', 'webp'].includes(outputFormat) ? (
                <img src={outputURL} alt="Converted" className="gif-output" />
              ) : (
                <div className="audio-player-wrapper">
                  {['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac', 'opus', 'alac', 'aiff', 'wma'].includes(outputFormat) ? (
                    <audio src={outputURL} controls />
                  ) : (
                    <video src={outputURL} controls />
                  )}
                </div>
              )}
              <button className="download-btn" onClick={downloadFile}>
                ⬇️ 下载文件
              </button>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>基于 <a href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noopener noreferrer">FFmpeg.wasm</a> 构建</p>
          <p className="privacy-hint">所有处理都在本地完成，文件不会上传到服务器</p>
          <p>作者：猫仙森MR CAT</p>
          <p>邮箱：<a href="mailto:valenbine@163.com">valenbine@163.com</a></p>
          <p>仓库：<a href="https://github.com/valenbine/FFmpegWebConverter" target="_blank" rel="noopener noreferrer">FFmpegWebConverter</a></p>
          <button onClick={clearLogs} className="clear-logs-btn">🧹 清空日志</button>
        </footer>
      </div>
    </div>
  )
}

export default App
