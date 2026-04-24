# FFmpeg Web Converter

基于 FFmpeg.wasm 的在线音视频格式转换工具，纯前端处理，保护隐私。

## ✨ 功能特性

- 🎬 **视频转视频** - 支持 MP4, WebM, AVI, MOV, MKV, GIF 格式互转
- 🎵 **音频转音频** - 支持 MP3, M4A, AAC, WAV, OGG, FLAC 格式互转
- 📥 **视频转音频** - 从视频中提取音频轨道
- 🎨 **现代化 UI** - 赛博朋克风格，响应式设计
- 🔒 **隐私保护** - 所有处理都在浏览器本地完成，文件不会上传到服务器
- 💻 **跨平台** - PC 和移动端完美适配
- 📊 **实时进度** - 显示转换进度百分比

## 🚀 快速开始

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

## 🛠️ 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 8
- **核心库**: FFmpeg.wasm 0.12
- **样式**: 原生 CSS (赛博朋克风格)
- **UI 设计**: 玻璃态 + 霓虹光效

## 📦 依赖

```json
{
  "@ffmpeg/ffmpeg": "^0.12.15",
  "@ffmpeg/util": "^0.12.2",
  "react": "^19.2.5",
  "react-dom": "^19.2.5"
}
```

## 🌐 浏览器支持

需要支持 **WebAssembly** 和 **SharedArrayBuffer** 的现代浏览器：

- Chrome 92+
- Firefox 90+
- Safari 14+
- Edge 92+

## ⚠️ 注意事项

1. **首次加载**：需要下载约 30MB 的 FFmpeg 核心文件
2. **内存限制**：大文件转换受浏览器内存限制
3. **性能**：转换速度取决于设备性能

## 📄 许可证

MIT License

## 🙏 致谢

基于 [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) 构建

---

Made with ❤️ by [@valenbine](https://github.com/valenbine/FFmpegWebConverter)
