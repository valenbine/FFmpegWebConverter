# 用户指令记忆

本文件记录了用户的指令、偏好和项目执行过程中沉淀出的关键信息，用于后续开发参考。

## 条目

[提交描述避免提及已放弃方案]
- Date: 2026-05-05
- Context: 用户要求本次改动的描述不要再提及 Android 适配过程，就当未做过该方向
- Category: 代码模式
- Instructions:
  - 提交信息、变更说明和后续描述应聚焦当前保留方案。
  - 对于已放弃的技术路线，不在对外描述中展开说明，除非用户明确要求回顾历史。

[桌面化产品命名与展示要求]
- Date: 2026-05-05
- Context: 用户要求调整桌面版命名、清理“Web/在线”字样并展示作者信息
- Category: 代码模式
- Instructions:
  - Windows 桌面版对外名称统一使用 `FFmpeg Converter`。
  - 面向用户的界面与页面文案应避免使用“Web”“在线”等表述，优先使用“本地”“桌面”“离线可用”等说法。
  - 页面底部 footer 需要展示作者、邮箱和仓库链接。

[FFmpegWebConverter 项目技术形态]
- Date: 2026-05-04
- Context: Agent 在执行“评估仓库封装为 Windows 桌面程序可行性”时发现
- Category: 代码结构
- Instructions:
  - 项目是 React + TypeScript + Vite 的纯前端应用，不是 Python Web 项目。
  - 核心转换能力来自 `@ffmpeg/ffmpeg` 与 `@ffmpeg/core-mt`，在本地 WebAssembly 环境执行媒体转换。
  - Windows 桌面版通过 Electron 封装，生产环境使用本地静态服务加载 `dist` 资源，而不是直接走 `file://`。

[Windows 打包与发布流程]
- Date: 2026-05-05
- Context: Agent 在执行“封装 Windows 安装包并接入 GitHub Actions/Release”时发现
- Category: 构建方法
- Instructions:
  - Windows 安装包命令是 `npm run build:desktop`。
  - Electron 打包使用 `electron-builder`，安装器目标为 `nsis`。
  - NSIS 配置要求允许用户选择安装目录：`oneClick=false`、`allowToChangeInstallationDirectory=true`。
  - GitHub Actions 提供三条流程：Windows 构建产物、Release 自动上传、按 tag 手动上传到 Release。
  - GitHub Release 产物中的 `.exe` 是安装包主体，`.blockmap` 和 `latest.yml` 供自动更新使用。

[FFmpeg Core 与离线运行策略]
- Date: 2026-05-05
- Context: Agent 在执行“支持离线运行与桌面打包”时发现
- Category: 依赖关系
- Instructions:
  - 构建前需执行 `npm run prepare:ffmpeg-core`，将 `@ffmpeg/core-mt` 与 `@ffmpeg/core` 分别复制到 `public/ffmpeg-core-mt` 和 `public/ffmpeg-core-st`。
  - 应用加载 FFmpeg 时优先使用本地 core 资源，缺失时再回退到 CDN。

[音频转码质量逻辑]
- Date: 2026-05-05
- Context: Agent 在执行“修复音频质量档位无效与视频转音频残留视频流”时发现
- Category: 代码模式
- Instructions:
  - 所有音频输出格式必须显式加 `-vn`，确保结果为纯音频。
  - 有损音频格式的质量档位必须映射到真实 `-b:a` 码率，而不是仅在 UI 中展示。
  - 无损音频格式（如 `wav`、`flac`、`alac`、`aiff`）不依赖码率档位区分输出大小。
