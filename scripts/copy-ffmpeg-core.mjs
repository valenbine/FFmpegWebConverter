import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const sourceDir = path.join(rootDir, 'node_modules', '@ffmpeg', 'core-mt', 'dist', 'esm')
const targetDir = path.join(rootDir, 'public', 'ffmpeg-core')

async function ensureSourceReadable() {
  try {
    await fs.access(sourceDir)
  } catch {
    throw new Error('找不到 @ffmpeg/core-mt，请先执行 npm install')
  }
}

async function copyRequiredFiles() {
  await fs.mkdir(targetDir, { recursive: true })
  const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js']
  await Promise.all(
    files.map((file) =>
      fs.copyFile(path.join(sourceDir, file), path.join(targetDir, file))
    )
  )
}

async function main() {
  await ensureSourceReadable()
  await copyRequiredFiles()
  console.log('FFmpeg core 已复制到 public/ffmpeg-core')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
