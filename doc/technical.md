# 《跟着我的脸》技术文档

## 1. 技术栈

- React 18 + TypeScript + Less + Vite 5，`base: './'`。
- 响应式 DOM 实现方向标牌、纸门、头像、反馈章和左右触区；不使用 Canvas 或整页 transform 缩放。
- Aigram runtime 只读取当前玩家资料；本作不提交排行榜、逐轮事件或私密数据。
- Web Audio API 合成翻牌、撞门、错误、连击和结算音效。

## 2. 目录结构

- `src/FollowMyFace/FollowMyFace.tsx`：20 秒状态机、方向线索、冲突概率、反应窗、判定和结算。
- `src/FollowMyFace/hooks/useIdentity.ts`：调试覆盖、当前 Aigram 资料和默认身份回退。
- `src/FollowMyFace/i18n/index.ts`：中文 / 英文文案与变量插值。
- `src/FollowMyFace/components/Icons.tsx`：方向和声音 SVG 图标。
- `src/FollowMyFace/audio.ts`：程序化音效。
- `src/FollowMyFace/FollowMyFace.less`：纸板游戏秀视觉、反馈和双视口适配。
- `src/shared/runtime/`：平台桥接规范副本。
- `_qa/`：全流程截图和输入/溢出/触区机械测试。
- `_production/`：正式海报的 Aigram transit 生成脚本与追溯记录。

## 3. 核心模块

- 状态：`cover → playing → feedback → playing → result`；`phaseRef` 和 `locked` 保证一次 Pointer 只结算一次。
- 计时：整局固定 20 秒；`requestAnimationFrame` 更新进度和单轮超时。反馈停留 350–460 ms，不接受输入。
- 难度：前两轮文字与头像一致；之后冲突率由 45% 提高到 75%，反应窗由 1350 ms 缩到 620 ms。
- 判定：玩家永远选择头像方向。只有在文字和头像冲突、且玩家选择文字方向时才累计 `fooled`；普通反向点击显示 `WRONG WAY`，超时单独计数。
- 身份：`?avatar_url=` / `?user_name=` → Aigram `data.name` 与 `head_url` → `AlterU` 和 `public/alteru-default-avatar.jpg`。
- 存储：仅用 `localStorage.follow_my_face_best` 保存最高分；不保存用户名、头像 URL 或逐轮反应。
- 适配：`100dvh`、安全区、短屏媒体查询；320×568 左右触区均为 142×108 px，无横向滚动。

## 4. 扩展点

- 改局长与反应窗：修改 `FollowMyFace.tsx` 的 `RUN_MS` 与 `nextCue()` 中 `deadlineMs`。
- 改冲突曲线：修改 `conflictChance`；前两轮一致规则应保留，以免教学依赖说明文字。
- 增加视觉干扰：只能改变标牌材质、位置或方向表达，不能每轮改变“跟头像”的主规则。
- 改视觉、撞门与短屏：修改 `FollowMyFace.less` 的语义颜色、舞台比例和 `max-height:650px` 规则。
- 接排行榜：以后可把最终 `score` 接入平台分数接口；不要上传逐轮方向、用户名或头像。
