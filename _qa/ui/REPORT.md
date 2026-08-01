# Follow My Face 视觉 QA

## 范围

- 视口：390×844、320×568。
- platform-layout：cover、congruent cue、conflict cue、wrong/followed-sign、result。
- external-guest：390×844 cover，只检查访客栏覆盖可用性。
- 机械测试：第一题一致、Pointer 到反馈、页面溢出、触区尺寸、错误头像 transform 和判词。

## 结论

- 最终决策：通过；P0/P1/P2 = 0/0/0。
- 首版 P1：错误章从 1.8 倍缩放入场，瞬间越过 320 px 视口并产生横向溢出。
- 修复：入场缩放改为 1.14，舞台增加 paint overflow 裁切；复验 `scrollWidth === 320`。
- 首版 P1：短屏左右触区高 104 px，低于需求文档 108 px。
- 修复：短屏控制区改为 108 px；复验两按钮均为 142×108 px。
- 首版 P1：所有非超时错误均累计“被标牌骗”，即使一致题按了完全相反方向。
- 修复：只有 `sign !== face && choice === sign` 才累计；一致题显示 `WRONG WAY`。

## 运行证据

- 第一题文字与头像一致：`firstCueCongruent: true`。
- 输入到 React 反馈状态：6–7 ms（自动化环境测量）。
- 320×568：`clientWidth=320`、`scrollWidth=320`、`clientHeight=568`、`scrollHeight=568`。
- 错误头像最终 transform：横向约 0.34、纵向约 1.18；判词在冲突题为 `YOU FOLLOWED THE SIGN`。
- 长用户名在标牌中单行省略，未撑宽界面。
- 中文 320×568 封面标题与 CTA 正确切换，超长中文用户名下仍为 `scrollWidth=320`。

## 视觉核对

- 主焦点：头像运动优先于黄标牌，红蓝门和箭头双编码左右。
- 高潮：错误不是闪红扣分，而是头像被透明门拍扁并出现具体原因。
- 响应式：320×568 仍保留完整标牌、两门、头像和 108 px 触区；390×844 使用更大的门和头像。
- 图标：方向和声音均为同线性 SVG；无 Emoji 功能图标。
- 正式海报：第一版因数字、伪字和假 UI 拦截；第二版只保留英文 `FOLLOW MY FACE`，人物为固定非东亚角色，底部安全区无关键内容，160×160 仍可读。
