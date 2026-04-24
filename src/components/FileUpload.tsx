import { useState, useCallback } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string
}

export default function FileUpload({ onFileSelect, acceptedTypes = 'video/*,audio/*' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const handleFile = useCallback((file: File) => {
    if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  return (
    <div className="upload-section">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          accept={acceptedTypes}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {fileName ? (
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div className="file-name">{fileName}</div>
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation()
                setFileName('')
                const input = document.getElementById('file-input') as HTMLInputElement
                if (input) input.value = ''
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <label htmlFor="file-input" className="upload-label">
            <div className="upload-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="upload-text">
              <p className="upload-hint">拖拽文件到此处，或点击选择文件</p>
              <p className="upload-formats">支持 MP4, AVI, MOV, MKV, MP3, WAV, FLAC 等格式</p>
            </div>
          </label>
        )}
      </div>
    </div>
  )
}
