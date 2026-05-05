# FFmpeg Converter

基于 FFmpeg.wasm 的本地音视频格式转换工具，纯本地处理，保护隐私。

## 功能特性

- 视频转视频，支持 12 种视频格式互转
- 音频转音频，支持 10 种音频格式互转
- 视频转音频，可从视频中提取音频轨道
- 现代化 UI，支持响应式布局
- 隐私保护，所有处理都在本地完成，文件不会上传到服务器
- 实时进度反馈，展示转换百分比和执行日志

## 支持的格式

### 视频格式（12 种）

| 格式 | 说明 | 图标 |
|------|------|------|
| **MP4** | 最常用的视频格式 | 🎬 |
| **WebM** | 网页优化格式 | 🌐 |
| **AVI** | Windows 通用格式 | 💻 |
| **MOV** | Apple 设备格式 | 🍎 |
| **MKV** | 高清视频容器 | 📦 |
| **GIF** | 动态图片 | 🎞️ |
| **WebP** | 现代动态图片 | 🖼️ |
| **WMV** | Windows 媒体视频 | 🪟 |
| **FLV** | Flash 视频 | 📹 |
| **3GP** | 移动设备格式 | 📱 |
| **MPEG** | DVD 标准格式 | 💿 |
| **TS** | 高清传输流 | 📡 |

### 音频格式（10 种）

| 格式 | 说明 | 图标 |
|------|------|------|
| **MP3** | 最常用的音频格式 | 🎵 |
| **M4A** | Apple 音频格式 | 🎧 |
| **AAC** | 高质量音频 | 🔊 |
| **WAV** | 无损音频 | 💿 |
| **OGG** | 开源音频格式 | 🎼 |
| **FLAC** | 无损压缩音频 | 🎹 |
| **Opus** | 高质量开源音频 | 🎙️ |
| **ALAC** | Apple 无损音频 | 🍎 |
| **AIFF** | 专业无损音频 | 🎚️ |
| **WMA** | Windows 媒体音频 | 📻 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 预览

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## Windows 桌面版

```bash
# 先安装依赖
npm install

# 构建 Windows 安装包（NSIS）
npm run build:desktop
```

生成产物目录：`release/`

说明：
- 桌面打包会先将 `@ffmpeg/core-mt` 与 `@ffmpeg/core` 复制到 `public/ffmpeg-core-mt` 和 `public/ffmpeg-core-st`，优先本地加载，支持离线使用。
- 如果本地 core 不存在，应用会自动回退到 CDN 加载。

### 自动构建（Windows）

- 工作流文件：`.github/workflows/windows-desktop-build.yml`
- 触发方式：
  - push 到 `main`
  - 在仓库 Actions 页面手动触发 `workflow_dispatch`
- 构建完成后可在 Actions 的 Artifacts 下载安装包。

### Release 自动上传安装包

- 工作流文件：`.github/workflows/windows-release-publish.yml`
- 触发方式：发布一个新的 Release（`published`）
- 行为：自动构建 Windows 安装包并上传到该 Release 的 Assets。

### 手动构建并上传到指定 Release

- 工作流文件：`.github/workflows/windows-manual-release-upload.yml`
- 触发方式：仓库 Actions 手动触发 `workflow_dispatch`
- 必填参数：`tag`（例如 `v0.0.1`）
- 行为：构建完成后把安装包上传到该 tag 对应的 Release Assets。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 8
- **核心库**: FFmpeg.wasm 0.12
- **样式**: 原生 CSS (赛博朋克风格)
- **UI 设计**: 玻璃态 + 霓虹光效

## 依赖

```json
{
  "@ffmpeg/ffmpeg": "^0.12.15",
  "@ffmpeg/util": "^0.12.2",
  "react": "^19.2.5",
  "react-dom": "^19.2.5"
}
```

## 浏览器支持

需要支持 **WebAssembly** 和 **SharedArrayBuffer** 的现代浏览器：

- Chrome 92+
- Firefox 90+
- Safari 14+
- Edge 92+

## 注意事项

1. **首次加载**：需要下载约 30MB 的 FFmpeg 核心文件
2. **内存限制**：大文件转换受浏览器内存限制
3. **性能**：转换速度取决于设备性能

## 使用场景

1. **视频格式转换** - 下载的视频无法播放？转换成通用格式！
2. **音频提取** - 从视频中提取背景音乐制作铃声
3. **音频格式转换** - 适配不同播放设备
4. **GIF/WebP 制作** - 视频片段转动态图片
5. **老视频转换** - FLV/3GP 老格式转 MP4

## 许可证

MIT License

## 致谢

基于 [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) 构建

---

作者：猫仙森MR CAT

邮箱：valenbine@163.com

仓库：https://github.com/valenbine/FFmpegWebConverter
