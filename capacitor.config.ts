import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.valenbine.ffmpegconverter',
  appName: 'FFmpeg Converter',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config
