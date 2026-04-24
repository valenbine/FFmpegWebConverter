import { SUPPORTED_FORMATS, QUALITY_PRESETS } from '../config/converter'

interface ConverterOptionsProps {
  outputFormat: string
  onFormatChange: (format: string) => void
  quality: string
  onQualityChange: (quality: string) => void
  mediaType: 'video' | 'audio'
}

export default function ConverterOptions({
  outputFormat,
  onFormatChange,
  quality,
  onQualityChange,
  mediaType
}: ConverterOptionsProps) {
  const formats = mediaType === 'video' ? SUPPORTED_FORMATS.video : SUPPORTED_FORMATS.audio

  return (
    <div className="options-section">
      <div className="option-group">
        <label className="option-label">输出格式</label>
        <div className="format-grid">
          {formats.map((format) => (
            <button
              key={format.value}
              className={`format-btn ${outputFormat === format.value ? 'active' : ''}`}
              onClick={() => onFormatChange(format.value)}
            >
              <span className="format-label">{format.label}</span>
              <span className="format-desc">{format.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <label className="option-label">转换质量</label>
        <div className="quality-slider-container">
          <div className="quality-presets">
            {QUALITY_PRESETS.map((preset) => (
              <button
                key={preset.value}
                className={`quality-btn ${quality === preset.value ? 'active' : ''}`}
                onClick={() => onQualityChange(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
