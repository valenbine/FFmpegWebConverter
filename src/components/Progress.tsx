interface ProgressProps {
  progress: number
  message: string
  isConverting: boolean
}

export default function Progress({ progress, message, isConverting }: ProgressProps) {
  if (!isConverting && progress === 0) return null

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
    </div>
  )
}
