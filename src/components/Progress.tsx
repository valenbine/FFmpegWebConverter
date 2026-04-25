interface ProgressProps {
  progress: number
  message: string
  isConverting: boolean
  logs?: string[]
}

export default function Progress({ progress, message, isConverting, logs = [] }: ProgressProps) {
  if (!isConverting && progress === 0 && logs.length === 0) return null

  return (
    <div className="progress-section">
      <div className="progress-info">
        <span className="progress-text">{message}</span>
        <span className="progress-percentage">{Math.round(progress * 100)}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {logs.length > 0 && (
        <div className="log-panel">
          <div className="log-header">
            <span className="log-title">📋 转换日志</span>
            <span className="log-count">{logs.length} 条</span>
          </div>
          <div className="log-content">
            {logs.map((log, index) => (
              <div key={index} className="log-item">
                <span className="log-time">
                  {new Date().toLocaleTimeString()}
                </span>
                <span className="log-message">{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
