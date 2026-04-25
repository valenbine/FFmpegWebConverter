  const convertVideo = async () => {
    if (!selectedFile || !loaded) {
      setError('请先选择要转换的文件')
      return
    }

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
      
      // 检查文件是否已加载
      await ffmpeg.writeFile(inputFile, await fetchFile(selectedFile))

      setMessage(`正在转换：${outputFormat.toUpperCase()}...`)
      
      // 使用配置文件中的命令行生成器
      try {
        const args = getCommandLine(inputFile, outputFile, outputFormat, quality)
        console.log('FFmpeg args:', args)
        
        await ffmpeg.exec(args)
      } catch (execError: any) {
        console.error('FFmpeg execution error:', execError)
        throw new Error(`FFmpeg 执行错误：${execError.message || '未知错误'}`)
      }

      setMessage('正在生成输出文件...')
      const data = await ffmpeg.readFile(outputFile)
      
      if (!data || data.length === 0) {
        throw new Error('转换后文件为空，可能转换失败')
      }
      
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
      const blob = new Blob([data], { type: mimeType })
      const url = URL.createObjectURL(blob)

      setOutputURL(url)
      setMessage('✅ 转换完成!')
      
      // 清理临时文件
      try {
        await ffmpeg.deleteFile(inputFile)
        await ffmpeg.deleteFile(outputFile)
      } catch (cleanupError) {
        console.warn('清理临时文件失败:', cleanupError)
      }
    } catch (error: any) {
      console.error('Conversion error:', error)
      const errorMessage = error?.message || error?.toString() || '未知错误'
      setError(`❌ 转换失败：${errorMessage}`)
      setMessage('转换失败')
    } finally {
      setIsConverting(false)
    }
  }