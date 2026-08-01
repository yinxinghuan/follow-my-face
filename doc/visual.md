# 《跟着我的脸》视觉与界面文档

## 1. Visual thesis

- Game and audience：在手机上用一根拇指完成的 20 秒方向冲突挑战。
- Emotional promise：玩家被自己的名字标牌诱导犯错，失败看得懂、笑得出、马上想再试。
- One-sentence visual thesis：一场用粗糙纸板搭成的 70 年代电视游戏秀，玩家头像在红蓝两扇门之间逃跑，自己的名字却举着相反路牌。
- Signature moment：玩家按错时，头像撞上透明纸门横向压扁，名字标牌像裁判章一样砸下 `YOU FOLLOWED THE SIGN`。
- Required qualities：三秒读懂、方向极清楚、喜剧反馈比抽象分数更强。

### Explored directions

1. 霓虹脑电扫描：能表达认知冲突，但与现有视觉玩具同质，且 UI 容易复杂。
2. 交通考试路牌：方向直观，但像驾驶题库，缺少人格与演出。
3. 纸板电视游戏秀（采用）：红蓝门天然编码左右，机械翻牌和头像撞门能承载反馈，夸张但不需要复杂场景。

## 2. Composition

- Orientation：响应式竖屏 DOM，390×844 与 320×568。
- Top 14%：短标题、20 秒进度条、连击；不放说明段落。
- Middle 58%：名字标牌、左右纸门和玩家头像；头像直径 104–132 px。
- Bottom 28%：左右两个整块触区；箭头 SVG 与 `LEFT / RIGHT` 双编码。
- Attention path：头像运动 → 左右纸门 → 拇指触区；冲突文字故意次于头像，但仍足以诱导。
- 平台内按无访客栏构图；外部访客栏仅做覆盖可用性检查。

## 3. Visual system

- Paper cream `#F6E8C8`；ink `#17130F`；left tomato `#E7432F`；right cobalt `#2858D8`；mustard `#F4C743`；success pickle `#A9C943`。
- 使用比例：奶油背景 46%，红蓝门/触区 38%，黑墨 11%，黄绿反馈 5%。
- Display：`Arial Black`, `Impact`, `PingFang SC`, sans-serif；34–52 px。
- Utility：`SFMono-Regular`, `Menlo`, monospace；11–13 px，0.09em tracking。
- 长用户名最大显示 16 个视觉字符，单行省略；完整名字仍通过 `aria-label` 暴露。
- 纸板边缘 3 px 黑线、无模糊玻璃；阴影使用 5 px 实色错版影。

## 4. Avatar and identity

- 图片回退顺序：`?avatar_url=` → 当前用户 `head_url` → `./alteru-default-avatar.jpg`。
- 文字回退顺序：`?user_name=` → 当前用户 `data.name` → 旧 `data.user_name` 兼容 → `AlterU`。
- 头像保持真实圆形裁切，不卡通化，不设 `crossOrigin`，不读 Canvas。
- 头像是方向线索本身；名字是干扰标牌，不允许二者只出现在 HUD。

## 5. Icons and controls

- 左右使用同一套 32×32 粗线 SVG 箭头；静音使用 24×24 同线宽 SVG。
- 禁止 Emoji 充当箭头、声音、生命或结果图标。
- 触区无圆角卡片，直接做成左右两块纸板踏板；按下位移 3 px。
- 焦点为 3 px 黑/白双层轮廓；颜色之外同时有方向箭头和文字。

## 6. Motion and feedback

- 翻牌 90 ms；头像预备 110 ms；作答锁定同帧；撞门 220 ms；错误压扁 260 ms；下一轮间隔正确 350 ms、错误 420 ms。
- 头像方向由 `translateX(±42px)`、身体倾斜 `rotate(±7deg)` 与反向纸屑尾迹共同表达。
- 正确：对应纸门向外旋开 14°，头像穿出 24 px，绿色 `NICE READ` 小章出现。
- 错误：头像 `scaleX(.34) scaleY(1.18)`，透明门闪出黑色轮廓，标牌下砸。
- 超时：两扇门同时轻拍，判词为 `TOO SLOW`。
- Reduced motion：取消循环漂移；以固定头像偏移、粗箭头与即时结果替代撞门位移。

## 7. Feedback matrix

| Event | Immediate | Peak | Audio | Recovery |
|---|---|---|---|---|
| 开始 | CTA 下压 | 红蓝门同时打开 | 三音开场 | 180 ms 首题 |
| 新题 | 标牌翻面 | 头像偏向真实方向 | 25 ms 翻牌 | 等输入 |
| 正确 | 触区下压、输入锁定 | 头像撞开正确门 | 冲击 + 高音 | 350 ms 下一题 |
| 错误 | 触区下压、输入锁定 | 头像拍扁 + 判词章 | 下滑 + 纸噪 | 420 ms 下一题 |
| 超时 | 进度窗耗尽 | 两门夹击 + TOO SLOW | 低频下滑 | 420 ms 下一题 |
| 5/10 连击 | 分数同帧更新 | 黄纸屑短爆 | 两/三音上行 | 不阻塞下一题 |
| 结算 | 最终分数出现 | 三张统计票落下 | 两/三音 | 再玩 |

## 8. Anti-patterns

- 禁止让玩家在“跟文字、跟颜色、跟头像”之间每轮换规则；本作永远只跟头像。
- 禁止长教程、三秒倒计时和多页难度选择。
- 禁止用颜色作为唯一左右信息。
- 禁止头像只轻微移动到看不出方向；短判定窗仍需有 42 px 偏移和尾迹。
- 禁止错误只闪红、震动或扣生命；必须演出“被路牌骗了”的具体原因。
- 禁止生成或重绘玩家头像。
- 禁止在游戏中显示排行榜、任务、货币或多层菜单。

## 9. Acceptance states

- loading/error/default identity；cover；first congruent cue；late incongruent cue；correct；wrong；timeout；streak 5；result；replay。
- 390×844 和 320×568 必须覆盖 cover、conflict、wrong、result；外部 guest 另检。
- 新测试者在封面三秒内能复述“跟头像、不跟字”；首轮点击到视觉反馈不超过一帧。
