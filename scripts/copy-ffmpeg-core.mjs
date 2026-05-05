import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const singleThreadSourceDir = path.join(rootDir, 'node_modules', '@ffmpeg', 'core', 'dist', 'umd')
const multiThreadSourceDir = path.join(rootDir, 'node_modules', '@ffmpeg', 'core-mt', 'dist', 'esm')
const singleThreadTargetDir = path.join(rootDir, 'public', 'ffmpeg-core-st')
const multiThreadTargetDir = path.join(rootDir, 'public', 'ffmpeg-core-mt')

async function ensureSourceReadable() {
  try {
    await Promise.all([fs.access(singleThreadSourceDir), fs.access(multiThreadSourceDir)])
  } catch {
    throw new Error('找不到 @ffmpeg/core 或 @ffmpeg/core-mt，请先执行 npm install')
  }
}

async function copyFiles(sourceDir, targetDir, files) {
  await fs.mkdir(targetDir, { recursive: true })
  await Promise.all(files.map((file) => fs.copyFile(path.join(sourceDir, file), path.join(targetDir, file))))
}

async function copyRequiredFiles() {
  await copyFiles(singleThreadSourceDir, singleThreadTargetDir, ['ffmpeg-core.js', 'ffmpeg-core.wasm'])
  await copyFiles(multiThreadSourceDir, multiThreadTargetDir, ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js'])
}

async function main() {
  await ensureSourceReadable()
  await copyRequiredFiles()
  console.log('FFmpeg 单线程与多线程 core 已复制到 public 目录')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
