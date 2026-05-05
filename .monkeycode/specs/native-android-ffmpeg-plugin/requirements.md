# Requirements Document

## Introduction

本文档定义“Capacitor + 原生 Android FFmpeg 插件改造”的需求，用于替代当前 Android 端 `ffmpeg.wasm` 方案在 WebView 中的兼容性问题。

## Glossary

- **Desktop App**: 现有基于 Electron 的 Windows 桌面版本。
- **Android App**: 现有基于 Capacitor 的 Android 应用壳。
- **Native FFmpeg Plugin**: 在 Android 原生层集成 FFmpeg 能力，并通过 Capacitor Plugin 暴露给前端的模块。
- **Transcode Job**: 一次媒体转换任务。
- **WASM Path**: 当前使用 `ffmpeg.wasm` 在前端执行转换的实现路径。

## Requirements

### Requirement 1

**User Story:** AS Android 用户, I want Android 版本稳定执行音视频转换, so that 我可以在移动端正常使用核心功能。

#### Acceptance Criteria

1. WHEN Android App 在受支持设备上启动转换任务, the Android App SHALL 通过 Native FFmpeg Plugin 执行转换任务。
2. IF Android WebView 不支持 `SharedArrayBuffer` 或 Worker 导入链路, the Android App SHALL 继续提供可用的转换能力。
3. WHILE Native FFmpeg Plugin 正在执行转换任务, the Android App SHALL 向前端提供任务状态与进度信息。

### Requirement 2

**User Story:** AS 项目维护者, I want 保留现有 Windows 桌面版能力, so that Android 改造不会破坏已稳定的桌面交付链路。

#### Acceptance Criteria

1. WHILE Windows Desktop Installer 被构建或运行, the system SHALL 继续使用现有 Electron 打包与前端转换逻辑。
2. WHEN Android Native FFmpeg Plugin 被引入, the system SHALL 将 Android 转换实现与 Windows 转换实现进行平台隔离。
3. IF Android 平台专用代码发生变更, the system SHALL 不要求修改 Windows 打包工作流的核心行为。

### Requirement 3

**User Story:** AS 前端开发者, I want 复用现有 React 界面和交互, so that 安卓改造成本可控。

#### Acceptance Criteria

1. WHEN Android Native FFmpeg Plugin 完成集成, the system SHALL 保留现有文件选择、格式选择、进度展示和下载入口的主界面结构。
2. IF 平台能力存在差异, the system SHALL 通过平台适配层屏蔽原生接口差异。
3. WHEN 前端发起转换, the system SHALL 使用统一的任务调用接口，而不是让页面直接感知 Android 原生细节。

### Requirement 4

**User Story:** AS 项目维护者, I want Android 原生插件具备明确的输入输出约束, so that 转换链路可测试、可维护。

#### Acceptance Criteria

1. WHEN 前端提交转换请求, the Native FFmpeg Plugin SHALL 接收输入文件路径、输出格式、质量档位及附加参数。
2. WHEN Native FFmpeg Plugin 完成转换, the Native FFmpeg Plugin SHALL 返回输出文件路径、输出文件大小和任务结果状态。
3. IF 转换失败, the Native FFmpeg Plugin SHALL 返回结构化错误信息，包括失败阶段与错误消息。

### Requirement 5

**User Story:** AS Android 用户, I want 明确获知原生转换任务的执行状态, so that 我可以理解等待时间与失败原因。

#### Acceptance Criteria

1. WHILE 转换任务执行中, the Android App SHALL 显示进度或阶段性状态。
2. IF 原生层无法提供精确百分比, the Android App SHALL 至少显示阶段性任务状态。
3. IF 转换任务失败, the Android App SHALL 向用户显示可读错误摘要，并记录技术详情用于排错。

### Requirement 6

**User Story:** AS 项目维护者, I want Android 构建流程支持原生插件集成, so that APK 构建可持续自动化。

#### Acceptance Criteria

1. WHEN Android Debug APK workflow 运行, the build pipeline SHALL 能够构建包含 Native FFmpeg Plugin 的 APK。
2. IF Native FFmpeg Plugin 依赖额外原生库或 AAR, the build pipeline SHALL 在 Android 工程中显式声明这些依赖。
3. WHEN 后续需要发布正式版, the design SHALL 支持扩展到 release APK 或 AAB 签名构建流程。
