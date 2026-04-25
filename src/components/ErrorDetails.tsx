interface ErrorDetailsProps {
  error: string
  errorDetails?: string
  onDismiss: () => void
}

export default function ErrorDetails({ error, errorDetails, onDismiss }: ErrorDetailsProps) {
  if (!error) return null

  return (
    <div className="error-detail-section">
      <div className="error-detail-header">
        <h4>❌ 错误详情</h4>
        <button className="dismiss-btn" onClick={onDismiss}>
          ✕ 关闭
        </button>
      </div>
      <div className="error-detail-content">
        <div className="error-summary">
          <strong>错误摘要：</strong>
          {error}
        </div>
        
        {errorDetails && (
          <div className="error-stack">
            <strong>技术详情：</strong>
            <pre>{errorDetails}</pre>
          </div>
        )}

        <div className="error-tips">
          <strong>💡 可能的原因：</strong>
          <ul>
            <li>文件格式不受支持或文件已损坏</li>
            <li>文件太大超出浏览器内存限制（建议 &lt; 100MB）</li>
            <li>浏览器不支持 WebAssembly 或 SharedArrayBuffer</li>
            <li>FFmpeg 核心加载失败，请刷新页面重试</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
