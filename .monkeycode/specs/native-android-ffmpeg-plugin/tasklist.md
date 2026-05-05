# 需求实施计划

- [ ] 1. 抽离前端转码平台适配层
  - 新增统一的转码服务接口，封装 `startTranscode`、`getJobStatus`、`cancelJob` 等调用。
  - 将现有页面直接操作 `ffmpeg.wasm` 的逻辑迁移到桌面实现分支，满足 Requirement 2、Requirement 3。

- [ ] 2. 搭建 Capacitor Android 原生插件骨架
  - [ ] 2.1 创建 Android 原生插件类与 TypeScript 调用声明
    - 定义前端到原生的输入输出结构，覆盖 `inputUri`、`outputFormat`、`quality`、`mediaType`，满足 Requirement 4。
  - [ ] 2.2 实现基础任务生命周期接口
    - 提供 `startTranscode`、`getJobStatus`、`getJobResult`、`cancelJob` 的空实现或最小实现，满足 Requirement 4、Requirement 5。

- [ ] 3. 集成 Android 原生 FFmpeg 执行引擎
  - [ ] 3.1 为 Android 工程引入原生 FFmpeg 依赖
    - 在 Gradle 中声明原生依赖与必要的 ABI 配置，满足 Requirement 6。
  - [ ] 3.2 实现原生命令参数映射
    - 将现有前端格式与质量参数映射到 Android 原生命令，保持音频 `-vn` 与质量码率语义一致，满足 Requirement 1、Requirement 4。
  - [ ] 3.3 实现输入文件复制与输出文件落盘逻辑
    - 处理 URI 到工作目录的转换、输出文件命名和元信息返回，满足 Requirement 4。
  - [ ]* 3.4 为原生命令映射编写单元测试
    - 覆盖视频转视频、视频转音频、音频转音频的参数生成。

- [ ] 4. 接通 Android 进度与错误回传
  - [ ] 4.1 实现任务状态机与进度上报
    - 在原生层维护 `pending/running/completed/failed/cancelled` 状态，满足 Requirement 1、Requirement 5。
  - [ ] 4.2 实现结构化错误码与错误详情回传
    - 统一 `input_unavailable`、`engine_init_failed`、`transcode_failed`、`output_missing`、`storage_permission_denied`，满足 Requirement 4、Requirement 5。
  - [ ]* 4.3 为状态机和错误映射编写测试
    - 验证成功、失败、取消三条主链路。

- [ ] 5. 在前端接入 Android 原生转码路径
  - [ ] 5.1 在平台适配层中接入 Capacitor Android Plugin
    - Android 平台走原生插件，Windows 桌面继续走现有桌面路径，满足 Requirement 2、Requirement 3。
  - [ ] 5.2 更新前端进度、结果和错误展示逻辑
    - 保持现有 UI 主结构不变，只替换底层执行来源，满足 Requirement 3、Requirement 5。
  - [ ]* 5.3 为平台适配层编写单元测试
    - 验证 Android 与 Desktop 路径分流。

- [ ] 6. 更新 Android 构建与自动化流程
  - [ ] 6.1 调整 Android debug APK workflow 以支持原生 FFmpeg 插件依赖
    - 确保 GitHub Actions 能构建包含原生依赖的 debug APK，满足 Requirement 6。
  - [ ] 6.2 补充 Android 构建说明与限制文档
    - 记录 debug APK、后续 release 签名构建与原生依赖说明，满足 Requirement 6。

- [ ] 7. 检查点 - 确保所有测试通过
  - 确保所有测试通过,如有疑问请询问用户
