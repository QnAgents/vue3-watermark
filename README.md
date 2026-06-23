# vue3-watermark

基于 SVG 的 Vue 3 水印指令。支持**识别卡阵列**（姓名 + 工号，错落平铺）与**提示语**（居中镂空遮罩），通过 `v-watermark` 指令挂载到任意元素。

---

## 安装

```bash
# npm
npm install vue3-watermark

# pnpm
pnpm add vue3-watermark

# bun
bun add vue3-watermark
```

---

## 快速开始

### 全局注册（推荐）

```ts
// main.ts
import { createApp } from 'vue'
import { watermarkPlugin } from 'vue3-watermark'
import App from './App.vue'

createApp(App).use(watermarkPlugin).mount('#app')
```

```vue
<template>
  <div v-watermark="watermarkOpts">
    <article>页面内容...</article>
  </div>
</template>

<script setup lang="ts">
import type { WatermarkOptions } from 'vue3-watermark'

const watermarkOpts: WatermarkOptions = {
  card:  { name: '张三丰', id: '023490' },
  array: { rotate: -38 },
  hint:  { content: '仅供内部使用' },
}
</script>
```

### 按需引入

```vue
<script setup lang="ts">
import { vWatermark } from 'vue3-watermark'
</script>

<template>
  <div v-watermark="{ card: { name: '张三丰', id: '023490' } }">
    内容...
  </div>
</template>
```

---

## 配置项

### `WatermarkOptions`（根配置）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `card` | `CardOptions` | — | **必填**，识别卡配置 |
| `row` | `RowOptions` | — | 行配置 |
| `array` | `ArrayOptions` | — | 阵列配置 |
| `hint` | `HintOptions` | — | 提示语配置（可选） |
| `opacity` | `number` | `0.1` | 整体水印层透明度（0 ~ 1） |
| `zIndex` | `number` | `2147483647` | 水印层层级 |

---

### `CardOptions`（识别卡）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | — | **必填**，姓名 |
| `id` | `string` | — | **必填**，工号 |
| `gapX` | `number` | `8` | 姓名与工号之间的水平间距（px） |
| `color` | `string` | `rgba(217,227,255,0.6)` | 文字颜色（#D9E3FF 60%） |
| `fontSize` | `number` | `14` | 字号（px） |
| `opacity` | `number` | `1` | 识别卡透明度（0 ~ 1） |

---

### `RowOptions`（行）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `cardGap` | `number` | `80` | 识别卡之间的水平间距（px） |

---

### `ArrayOptions`（阵列）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rowGap` | `number` | `60` | 行之间的垂直间距（px） |
| `rowOffsetX` | `number` | `20` | 每行递增水平偏移（px），产生错落效果 |
| `rotate` | `number` | `-38` | 阵列整体旋转角度（deg） |

---

### `HintOptions`（提示语）

居中显示一次，不重复。阵列在提示语区域自动**镂空**（非遮盖）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string \| string[]` | — | **必填**；支持 `\n` 换行或传数组 |
| `fontSize` | `number` | `24` | 字号（px） |
| `fontWeight` | `string \| number` | `'bold'` | 字重 |
| `color` | `string` | 同 `card.color` | 文字颜色 |
| `rotate` | `number` | `-38` | 旋转角度（deg） |
| `borderRadius` | `number` | `10` | 镂空区域圆角（px） |
| `paddingX` | `number` | `40` | 水平内边距（px） |
| `paddingY` | `number` | `20` | 垂直内边距（px） |
| `lineHeight` | `number` | `fontSize × 1.6` | 行高（px），多行时生效 |
| `opacity` | `number` | `1` | 提示语透明度（0 ~ 1） |

---

## 示例

### 基础水印

```vue
<div v-watermark="{
  card: { name: '张三丰', id: '023490' }
}">
  内容区域
</div>
```

### 带提示语（镂空阵列）

```vue
<div v-watermark="{
  opacity: 0.12,
  card:  { name: '张三丰', id: '023490', color: '#6a0dad' },
  array: { rowGap: 55, rowOffsetX: 20, rotate: -38 },
  hint:  { content: '仅供内部使用', color: '#6a0dad' },
}">
  内容区域
</div>
```

### 多行提示语

```vue
<!-- 数组语法 -->
<div v-watermark="{
  card: { name: '李四', id: '009988' },
  hint: { content: ['草稿文件', '未经审批'], lineHeight: 36 },
}">
  内容区域
</div>

<!-- \n 字符串语法 -->
<div v-watermark="{
  card: { name: '李四', id: '009988' },
  hint: { content: '草稿文件\n未经审批' },
}">
  内容区域
</div>
```

### 自定义角度与透明度

```vue
<div v-watermark="{
  opacity: 0.18,
  card:  { name: 'Zhang Sanfeng', id: '023490', color: '#fff', opacity: 0.7 },
  array: { rotate: -45 },
  hint:  { content: 'CONFIDENTIAL\nDO NOT DISTRIBUTE', rotate: 0, color: '#ff453a' },
}">
  内容区域
</div>
```

---

## 透明度层级

```
整体层  opacity: 0.1      ← WatermarkOptions.opacity（CSS 层）
  ├── 识别卡  opacity: 1  ← CardOptions.opacity（SVG <g>）
  └── 提示语  opacity: 1  ← HintOptions.opacity（SVG <g>）
```

---

## 注意事项

- 宿主元素自动设置 `position: relative` 和 `isolation: isolate`
- 水印层使用 `z-index: 2147483647 !important`，确保永远在最顶层
- 水印为 SVG 渲染，不可选中、不可复制
- `ResizeObserver` 自动响应容器尺寸变化

---

## 本地开发

```bash
git clone https://github.com/your-name/vue3-watermark.git
cd vue3-watermark
pnpm install
pnpm build      # 输出 dist/
open demo/index.html  # 预览效果
```

---

## License

MIT
