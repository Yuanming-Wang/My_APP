---
name: Museum Archive Aesthetic
colors:
  surface: '#fff8f4'
  surface-dim: '#e9d7c6'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e6'
  surface-container: '#feebd9'
  surface-container-high: '#f8e5d4'
  surface-container-highest: '#f2dfce'
  on-surface: '#231a0f'
  on-surface-variant: '#54433a'
  inverse-surface: '#392e23'
  inverse-on-surface: '#ffeedf'
  outline: '#877369'
  outline-variant: '#dac2b6'
  surface-tint: '#934b19'
  primary: '#6c2f00'
  on-primary: '#ffffff'
  primary-container: '#8b4513'
  on-primary-container: '#ffc29f'
  inverse-primary: '#ffb68c'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#004662'
  on-tertiary: '#ffffff'
  tertiary-container: '#005f83'
  on-tertiary-container: '#97d7ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68c'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753401'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#8bcff8'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#fff8f4'
  on-background: '#231a0f'
  surface-variant: '#f2dfce'
typography:
  headline-lg:
    fontFamily: sourceSerifFour
    fontSize: 34px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: sourceSerifFour
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.4'
  headline-md:
    fontFamily: sourceSerifFour
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.5'
  body-lg:
    fontFamily: sourceSerifFour
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.8'
  body-md:
    fontFamily: sourceSerifFour
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.8'
  note-text:
    fontFamily: literata
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  collection-id:
    fontFamily: bodoniModa
    fontSize: 16px
    fontWeight: '400'
    letterSpacing: 0.1em
  label-bold:
    fontFamily: sourceSerifFour
    fontSize: 16px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  margin-page: 32px
  gutter-grid: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
  touch-target-min: 88px
---

> Token note: the frontmatter above is a working surface scale; the canonical brand canvas is Antique White `#F8F5EE` and Ink Black `#2D2318`, as described below.

## Brand & Style
This design system is built upon the "Museum Collection Quality" narrative, transforming a digital interface into a tactile, prestigious archive. It is designed specifically for seniors, prioritizing high-legibility, physical metaphors, and an emotional sense of permanence.

The style is **Tactile and Skeuomorphic**, utilizing the textures of physical preservation—linen, parchment, and etched metal. It avoids the coldness of modern minimalism in favor of "museum shelf" depth, where every digital artifact is treated as a physical heirloom. The atmosphere is quiet, respectful, and timeless, evoking the feeling of browsing a private, well-lit gallery.

## Colors
The palette is rooted in historical preservation. The **Antique White** (#F8F5EE) serves as the primary canvas, mimicking the texture of museum-grade rice paper. **Linen** (#E5DCD1) is used for structural containers to provide subtle depth without harsh value shifts.

**Ochre** (#8B4513) acts as the primary action color, providing a warm, earthy contrast that is easily distinguishable for senior eyes. **Decorative Gold** (#D4AF37) is reserved for borders, dividers, and premium accents to signify "collection-grade" importance. Text colors prioritize high contrast, using **Ink Black** (#2D2318) for maximum readability against the warm backgrounds.

## Typography
Typography is treated as a "published" document. **Source Serif Four** is the workhorse, providing a sturdy, authoritative serif feel that aids readability for older users. 

For personal touches, such as voice transcriptions or handwritten notes, **Literata** provides a warm, bookish alternative that feels intimate. **Bodoni Moda** is used exclusively for page numbers and collection IDs, adding a touch of high-fashion editorial elegance. 

A generous **1.8x line height** is strictly enforced for body text to prevent "line crowding," ensuring seniors can track text easily across the screen.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy, creating a stable and predictable environment. 

- **Generous Margins:** A mandatory 32px horizontal margin ensures content is never cramped against the device edges, providing "breathing room" similar to a matted picture frame.
- **Vertical Rhythm:** Spacing is oversized to accommodate large touch targets. The minimum vertical touch area for any interactive element is 88px.
- **Museum Shelf Reflow:** On desktop/tablet, content is arranged in "shelves" (rows) with clear horizontal dividers in Decorative Gold. On mobile, these shelves stack vertically, maintaining the 32px safety margin.

## Elevation & Depth
Depth is created through "Museum-grade Elevation." Instead of high-shadow modern depths, we use **Tonal Layers** combined with very soft, diffused ambient shadows.

- **The Shelf:** Background surfaces use a linen texture overlay (8% opacity). 
- **Picture Frames:** Active items or featured photos use a "Frame" effect: a 4px white border, a 1px Gold (#D4AF37) outer stroke, and a soft shadow (0 4px 16px rgba(45,35,24,0.08)).
- **Spotlight Effect:** When an item is selected or active, a subtle radial gradient (spotlight) is applied behind it, brightening the linen texture to guide the user's focus.

## Shapes
The shape language is primarily **Pill-shaped (3)** for interactive elements, providing a soft, non-threatening feel for touch. 

However, content containers (photos, archival records) use **Sharp (0)** or **Soft (1)** corners to mimic physical paper, cardstock, and photo prints. This distinction helps users instantly differentiate between "something I can press" (rounded) and "something I am viewing" (square).

## Components

### Buttons
- **Primary:** Capsule-shaped with a subtle gradient from Ochre (#8B4513) to a slightly warmer burnt orange. Text is white for contrast.
- **Secondary:** Capsule-shaped with a Gold (#D4AF37) border and no fill, using Ink Black text.

### Cards (The Archive Item)
Archival items are styled as framed photographs. They feature a wide white inner margin (simulating a photo mat) and a thin Decorative Gold outline. Use the parchment texture for cards that contain only text.

### Inputs & Fields
Input fields use the Linen (#E5DCD1) background with a "pressed" inset shadow to feel like an engraved area in a display case. Labels are always placed above the field in **label-bold** typography.

### Etched Icons
Icons should be monochromatic Ink Black, styled with a slight "etched metal" look (0.5px offset highlight) to feel like physical plaques.

### Voice Transcription (Note)
Transcription areas use the parchment texture background and the **note-text** font (Literata) to differentiate them from the "official" archival metadata.

---

## Detailed Visual Specification

> 以下内容从原产品方案迁移，作为完整视觉规范；产品目标与流程见 [PRODUCT.md](../docs/PRODUCT.md)。

## 页面级视觉规范

### 设计哲学："馆藏质感"

**核心主张**：老人打开APP，应该像走进一家**私人收藏馆**——温暖、有重量、不冰冷、不廉价、有历史感。

- **温度感**：拒绝纯白色背景，采用多层级"纸张色"（米白、亚麻、羊皮纸）。
- **馆藏感**：微缩博物馆设计语言——画框、展牌、射灯效果、藏品编号。
- **克制感**：不堆元素、不炫特效，每一个动画都有目的（安抚、反馈、庆祝）。
- **一致性**：全APP只有3套"馆藏主题"，每套主题内部100%一致。

---

### 全局视觉规范

#### 色彩系统（升级为"博物馆色卡"）

| 用途 | 色值 | 使用场景 |
|------|------|----------|
| **主背景色** | `#F8F5EE`（古董白） | 全局页面底色，模拟博物馆宣纸 |
| **次背景色** | `#E5DCD1`（亚麻色） | 卡片底色、书架背景 |
| **强调色** | `#8B4513`（赭石色） | 主按钮、重要通知、点赞心形（古典优雅） |
| **主题色-岁月鎏金** | `#D4A574` + `#C9B896` | 战友/军旅主题：黄铜质感 |
| **主题色-碧海蓝天** | `#4A6FA5` + `#7BA3C4` | 旅行主题：海洋蓝渐变 |
| **主题色-家的温度** | `#B8860B` + `#DAA520` | 家人主题：暖金渐变 |
| **文字主色** | `#2D2318`（墨黑） | 大标题、正文（印刷级黑度） |
| **文字次色** | `#5A4D3F`（烟墨） | 辅助文字、时间戳 |
| **禁用/水印** | `#A89887`（石墨灰） | 水印文字、不可点击状态 |
| **装饰金边** | `#D4AF37`（真金色） | 仅用于会员版封面、按钮描边 |

**设计原则**：
- 全APP不使用纯黑（`#000000`）和纯白（`#FFFFFF`），降低视觉刺激。
- 所有文字与背景对比度≥5:1，满足适老化无障碍标准。
- 主题色仅用于3套固定"馆藏主题"，不开放给用户选择。
- **新增"真金色"装饰层**：仅在会员版出现，营造"专属感"。

#### 字体规范（升级为"出版级"）

| 层级 | 字号 | 字重 | 字体 | 用途 |
|------|------|------|------|------|
| **超大标题** | 36pt | Bold | 思源宋 Bold | 首页"今日藏品"数量、空状态 |
| **大标题** | 28pt | Bold | 思源宋 Bold | 页面标题、书架书名 |
| **正文** | 22pt | Medium | 思源宋 Medium | 引导问题、语音转写文字 |
| **辅助文字** | 18pt | Regular | 思源宋 Regular | 时间戳、页码、小标签 |
| **按钮文字** | 24pt | Bold | 思源宋 Bold | 所有可点击按钮 |
| **手写体** | 20pt | Regular | 方正楷体GBK | 语音转写文字，像老人亲笔 |
| **藏品编号** | 14pt | Light | Didot（优雅衬线） | 页码、藏品编号 |

**设计原则**：
- 全APP统一使用**思源宋体**为主字体，增加"书卷气"和"出版品质"。
- 行高1.8倍，段落间距24pt，绝不出现文字拥挤。
- **新增"藏品编号"字体**：页码、编号使用优雅的Didot字体，增加博物馆感。

#### 间距与圆角（升级为"馆藏级"）

| 元素 | 规范 |
|------|------|
| **页面边距** | 左右≥32pt，上下≥24pt |
| **卡片圆角** | 20pt（大卡片）、16pt（小卡片） |
| **按钮圆角** | 50%（胶囊形）或 20pt（大按钮） |
| **图片圆角** | 12pt（缩略图）、0pt（纪念册内页全出血大图） |
| **阴影层级** | <br>- 悬浮阴影：`0 8px 24px rgba(45,35,24,0.12)`<br>- 卡片阴影：`0 4px 16px rgba(45,35,24,0.08)`<br>- 轻阴影：`0 2px 8px rgba(45,35,24,0.06)` |
| **描边** | 会员版按钮使用0.5pt真金色描边 |

---

### 页面级视觉设计

#### 首页："我的收藏馆"

**布局（升级）**：
- 顶部：大字号问候语"下午好，今天有藏品要入馆吗？"（根据时间变化文案）。
- 中部："今日藏品"大卡片——占据屏幕55%宽度，**带画框效果**（白边+描边+轻微阴影），下方大按钮"做成藏品"。
- 下部："我的收藏馆"——横向滑动卡片列表，每本书封面为竖版卡片（比例2:3，像真实书籍），带**书脊效果**（皮革纹理+烫金书名），显示书名、制作日期、收到赞数（镀金心形+数字）。
- 底部：固定导航栏，三个大图标按钮（"做新藏品""我的收藏馆""叫孩子帮忙"），图标采用**蚀刻金属风格**。

**视觉细节（新增）**：
- 收藏馆区域背景使用**亚麻纸纹理**（透明度8%的纤维纹理）。
- 空状态时，展示一幅手绘风格插画（一位老人站在私人收藏馆里，阳光透过天窗照在空展架上），配文案"你的第一件藏品，从这里开始"。
- 页面滚动时，顶部问候语渐隐，"旧时光"logo（烫金手写体风格）渐显。
- **新增"射灯效果"**：当用户停留在某本书上时，该书上方出现微妙的射灯渐变，像博物馆里的展品。

#### 选图页："挑选藏品"

**布局（升级）**：
- 顶部：大标题"挑选几张今天的照片" + 右上角"已选X件藏品"计数器（赭石色圆形badge，带金边）。
- 中部：照片网格，每张照片带**画框效果**（白边+描边），选中后画框变为赭石色3pt描边，同时照片轻微放大（scale 1.05）+ 射灯效果。
- 底部：固定浮层，展示已选照片的小缩略图横条（可左右滑动删除），右侧大按钮"入馆"。

**视觉细节（新增）**：
- 照片默认显示为"**博物馆展架风格**"：白边+画框+底部阴影，增加藏品感。
- 超过12张时，未选中的照片变为灰度（降低饱和度），视觉上自然引导"够了"。
- **新增"藏品编号"**：选中的照片左上角显示小编号（1、2、3...），增加仪式感。

#### 说话页："讲述故事"

**布局（升级）**：
- 全屏展示当前照片（上下留边距，带画框），照片下方是**引导问题文案**（26pt，墨黑色，居中）。
- 屏幕下半部分：大面积"长按讲述"区域——占据屏幕底部40%，**赭石色到暖金色渐变背景**，中央大图标（蚀刻金属麦克风）+ 文字"按住这里，慢慢讲"。
- 说话中：背景变为**暖金色光晕脉冲动画**（像老式留声机），中央显示声波可视化（手绘风格波形）。
- 说完后：文字以"打字机动画"逐字出现在照片下方（手写体），同时出现"播放原声"小按钮（圆形，带蚀刻金属播放图标）。

**视觉细节（新增）**：
- 引导问题文案区域使用**羊皮纸背景**（浅黄色，带纤维纹理），增加"写信"的仪式感。
- 长按区域在按下时产生"按压凹陷"效果（内阴影），松手时轻微回弹。
- **新增"留声机效果"**：说话时背景出现老式留声机的微妙插画（透明度10%），增加怀旧感。

#### 生成页："正在入藏"

**布局（升级）**：
- 全屏沉浸式动画，背景为深墨色（`#2D2318`）。
- 中央：一本虚拟的书从0开始"生长"——**烫金封面**先出现（皮革纹理、烫金书名），然后内页一张一张"飞入"叠放，最后书脊合拢，**射灯从上方打下**。
- 底部：文案"正在为你入藏..."（手写体，逐字出现）。
- 完成后：书自动翻开第一页，背景音乐渐起，进入预览模式。

**视觉细节（新增）**：
- 入藏动画使用**拟物风格**：封面有皮革纹理、书页有纸张厚度、翻页时有弯曲形变、射灯从上方缓缓移动。
- 动画时长控制在4-6秒，不可跳过——这是老人的"**藏品诞生时刻**"。
- 背景音乐根据主题自动选择：岁月鎏金用口琴/手风琴、碧海蓝天用轻快钢琴、家的温度用弦乐四重奏。
- **新增"藏品编号"**：书脊上显示自动生成的编号（如"OT-2026-001"，Old Time）。

#### 预览/阅读页："翻阅藏品"

**布局（升级）**：
- 全屏沉浸式阅读，上下隐藏系统状态栏和导航栏。
- 每页：照片占据上半部分（全出血或带画框，根据主题），下半部分为文字区（羊皮纸背景，带画框）。
- 翻页方式：左右滑动，带有**真实3D翻页效果**（页面像真实纸张一样弯曲，带轻微书香动画）。
- 底部常驻：细进度条（显示当前页码/总页数）+ 播放/暂停BGM按钮 + 分享按钮。

**视觉细节（新增）**：
- 页面之间保留"纸张缝隙"（1pt石墨灰分割线），增加真实感。
- 照片自动套用"**博物馆级滤镜**"：增加暖色调、轻微暗角、降低对比度、模拟胶片颗粒感。
- 文字区顶部自动添加"章节标题"（根据照片内容AI提取，如"第二章·老战友重逢"），章节号使用优雅的Didot字体。
- 尾页设计为"**收藏证书**"风格：显示制作日期、地点、"由XXX珍藏"（老人署名）、旧时光烫金logo（免费版）或"旧时光荣誉出品"（会员版，带编号）。

#### 分享页："送出去"

**布局（升级）**：
- 顶部：大标题"送给谁珍藏？"。
- 中部：两个大卡片并排：
  - 左："发给微信好友"（微信绿色图标）——生成翻页链接。
  - 右："发朋友圈"（相机图标）——生成15秒翻页视频。
- 下部：分享预览图——展示**3D精装书mockup**（皮革封面、烫金书名、书脊、射灯效果），老人可以确认"这个封面够不够体面"。

**视觉细节（新增）**：
- 分享预览图采用"**博物馆藏品级mockup**"风格：封面图映射到一本立体的书上，带阴影、反光、射灯效果，像真的在展示一件藏品。
- 生成视频时，展示"正在拍成纪录片..."进度条，带胶片滚动动画。
- 分享成功后，全屏**金箔飘落动画**（手绘风格金箔，非3D粒子），配文案"你的藏品飞出去啦！"。

---

### 动效规范

| 场景 | 动效 | 时长 | 风格 |
|------|------|------|------|
| 页面进入 | 从底部滑入+轻微弹性+淡入 | 500ms | 自然物理感 |
| 按钮点击 | 缩放至0.95+回弹+金边闪烁 | 200ms | 柔软反馈 |
| 照片选中 | 画框变色+放大+射灯效果+阴影加深 | 250ms | 明确但不突兀 |
| 语音录制 | 背景色光晕脉冲+手绘声波+留声机动画 | 持续 | 温暖有机 |
| 翻页 | 3D弯曲形变+书香粒子飘散 | 350ms | 拟物真实 |
| 生成入藏 | 书页飞入+合拢+射灯从上方打下 | 4000-6000ms | 仪式感，不可跳过 |
| 分享成功 | 金箔飘落+2秒 | 2500ms | 庆祝感 |
| 收到点赞 | 镀金心形跳动+震动+金边闪烁 | 350ms | 即时正反馈 |

**设计原则**：
- 所有动效使用**缓动曲线**（ease-out-expo），拒绝线性动画的机械感。
- 低端机上自动降级：3D翻页变为2D滑动，粒子效果变为静态插画。
- 动效不是装饰，是**情绪引导**——让老人在每个环节都感受到"被重视"。

---

### 插画与图标系统

**风格**：**蚀刻版画风格**（金属质感、线条流畅、古典优雅），像博物馆藏品标签。

| 场景 | 插画内容 |
|------|----------|
| 空状态-收藏馆 | 老人站在私人收藏馆里，阳光透过天窗照在空展架上 |
| 空状态-选图 | 打开的空画框，几片银杏叶飘入 |
| 引导-说话 | 一只小鸟停在蚀刻金属麦克风上，歪头倾听 |
| 成功-分享 | 一本书长出翅膀，飞向远方，身后飘落金箔 |
| 收到点赞 | 两只手隔着屏幕击掌，掌心有金箔闪烁 |

**图标**：
- 全APP不使用任何扁平化矢量图标（如Material Design风格）。
- 所有图标采用**蚀刻金属风格**，线条流畅，带0.5pt金边描边。
- 图标尺寸≥56×56pt，点击热区≥88×88pt。

---


## 视觉设计速查表

| 元素 | 规范 | 备注 |
|------|------|------|
| 全局背景 | `#F8F5EE` 古董白 | 模拟博物馆宣纸 |
| 主按钮 | 赭石色到暖金色渐变，胶囊形，24pt Bold，金边0.5pt | 点击热区≥88×88pt |
| 大标题 | 28pt Bold 墨黑色 | 思源宋 Bold |
| 正文 | 22pt Medium 墨黑色 | 行高1.8倍，段落间距24pt |
| 语音文字 | 方正楷体GBK，打字机动画 | 增加"我写的"仪式感 |
| 照片展示 | 博物馆画框风格（白边+描边+阴影） | 选中后赭石色画框+放大+射灯 |
| 翻页效果 | 3D弯曲形变+书香粒子，350ms | 低端机降级为2D滑动 |
| 封面生成 | 烫金皮革3D mockup+射灯效果 | 分享预览图核心视觉 |
| 插画风格 | 蚀刻版画风格（金属质感） | 像博物馆藏品标签 |
| 图标风格 | 蚀刻金属风格，56pt，金边0.5pt | 拒绝扁平化矢量图标 |
| 空状态 | 蚀刻版画插画+温暖文案 | 老人站在私人收藏馆里 |
| 入藏动画 | 拟物书页飞入+射灯从上方打下，4-6秒 | 仪式感，不可跳过 |
| 成功反馈 | 金箔飘落，2.5秒 | 庆祝感 |

