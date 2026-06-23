import type { WatermarkOptions } from './types'

const DEFAULT_CARD_COLOR         = 'rgba(217, 227, 255, 0.6)'
const DEFAULT_CARD_GAP_X         = 8
const DEFAULT_CARD_FONT_SIZE     = 14
const DEFAULT_ROW_CARD_GAP       = 80
const DEFAULT_ARRAY_ROW_GAP      = 60
const DEFAULT_ARRAY_ROW_OFFSET_X = 20
const DEFAULT_ARRAY_ROTATE       = -38
const DEFAULT_HINT_FONT_SIZE     = 24
const DEFAULT_HINT_FONT_WEIGHT   = 'bold'
const DEFAULT_HINT_ROTATE        = -38
const DEFAULT_HINT_BORDER_RADIUS = 10
const DEFAULT_HINT_PADDING_X     = 40
const DEFAULT_HINT_PADDING_Y     = 20

// ── 共享 canvas，避免重复创建 ──────────────────────────────────────────────
let _canvas: HTMLCanvasElement | null = null
let _ctx: CanvasRenderingContext2D | null = null

function getCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (!_canvas) {
    _canvas = document.createElement('canvas')
    _ctx = _canvas.getContext('2d')
  }
  return _ctx
}

function measureText(
  text: string,
  fontSize: number,
  fontWeight: string | number = 'normal',
  fontFamily = 'sans-serif',
): number {
  const ctx = getCtx()
  if (!ctx) return text.length * fontSize * 0.6
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  return ctx.measureText(text).width
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toLines(content: string | string[]): string[] {
  return Array.isArray(content) ? content : content.split('\n')
}

// ── hintRect：提示语矩形参数（mask + 文字渲染共用）──────────────────────────

interface HintRectResult {
  cx: number
  cy: number
  rectW: number
  rectH: number
  borderRadius: number
  rotate: number
  fontSize: number
  fontWeight: string | number
  lineHeight: number
  lines: string[]
}

function hintRect(width: number, height: number, opts: WatermarkOptions): HintRectResult | null {
  const { hint } = opts
  if (!hint) return null

  const fontSize     = hint.fontSize     ?? DEFAULT_HINT_FONT_SIZE
  const fontWeight   = hint.fontWeight   ?? DEFAULT_HINT_FONT_WEIGHT
  const paddingX     = hint.paddingX     ?? DEFAULT_HINT_PADDING_X
  const paddingY     = hint.paddingY     ?? DEFAULT_HINT_PADDING_Y
  const borderRadius = hint.borderRadius ?? DEFAULT_HINT_BORDER_RADIUS
  const rotate       = hint.rotate       ?? DEFAULT_HINT_ROTATE
  const lineHeight   = hint.lineHeight   ?? fontSize * 1.6
  const lines        = toLines(hint.content)

  const maxLineW = Math.max(...lines.map(l => measureText(l, fontSize, fontWeight)))
  const rectW = maxLineW + paddingX * 2

  const textBlockH = lines.length === 1
    ? fontSize
    : lineHeight * (lines.length - 1) + fontSize
  const rectH = textBlockH + paddingY * 2

  return {
    cx: width / 2,
    cy: height / 2,
    rectW, rectH, borderRadius, rotate,
    fontSize, fontWeight, lineHeight, lines,
  }
}

// ── buildRow：单行识别卡 ──────────────────────────────────────────────────

function buildRow(
  width: number,
  y: number,
  offsetX: number,
  opts: WatermarkOptions,
): string {
  const { card, row } = opts
  const fontSize = card.fontSize ?? DEFAULT_CARD_FONT_SIZE
  const color    = card.color   ?? DEFAULT_CARD_COLOR
  const gapX     = card.gapX   ?? DEFAULT_CARD_GAP_X
  const cardGap  = row?.cardGap ?? DEFAULT_ROW_CARD_GAP

  const nameW = measureText(card.name, fontSize)
  const idW   = measureText(card.id, fontSize)
  const stepW = nameW + gapX + idW + cardGap

  const startX = -(stepW - (offsetX % stepW))
  const texts: string[] = []

  for (let x = startX; x < width * 1.5; x += stepW) {
    texts.push(
      `<text x="${x.toFixed(1)}" y="${y}" font-size="${fontSize}" fill="${color}" font-family="sans-serif" dominant-baseline="middle">${escapeXml(card.name)}</text>`,
    )
    texts.push(
      `<text x="${(x + nameW + gapX).toFixed(1)}" y="${y}" font-size="${fontSize}" fill="${color}" font-family="sans-serif" dominant-baseline="middle">${escapeXml(card.id)}</text>`,
    )
  }
  return texts.join('\n')
}

// ── buildArray：阵列（含 hint 镂空 mask）─────────────────────────────────

function buildArray(width: number, height: number, opts: WatermarkOptions): string {
  const { array } = opts
  const rowGap      = array?.rowGap     ?? DEFAULT_ARRAY_ROW_GAP
  const rowOffsetX  = array?.rowOffsetX ?? DEFAULT_ARRAY_ROW_OFFSET_X
  const rotate      = array?.rotate     ?? DEFAULT_ARRAY_ROTATE
  const fontSize    = opts.card.fontSize ?? DEFAULT_CARD_FONT_SIZE
  const cardOpacity = opts.card.opacity  ?? 1

  const diagonal = Math.sqrt(width * width + height * height)
  const extraH   = (diagonal - height) / 2
  const cx = width / 2, cy = height / 2

  const rows: string[] = []
  let ri = 0
  for (
    let y = -extraH + fontSize;
    y < height + extraH;
    y += rowGap + fontSize, ri++
  ) {
    rows.push(buildRow(width + (diagonal - width), y, ri * rowOffsetX, opts))
  }

  const hr = hintRect(width, height, opts)
  let maskDefs = ''
  let maskAttr = ''
  if (hr) {
    maskDefs = `<defs>
  <mask id="hintKnockout">
    <rect width="${width}" height="${height}" fill="white"/>
    <rect
      x="${(hr.cx - hr.rectW / 2).toFixed(1)}"
      y="${(hr.cy - hr.rectH / 2).toFixed(1)}"
      width="${hr.rectW.toFixed(1)}"
      height="${hr.rectH.toFixed(1)}"
      rx="${hr.borderRadius}"
      ry="${hr.borderRadius}"
      fill="black"
      transform="rotate(${hr.rotate}, ${hr.cx.toFixed(1)}, ${hr.cy.toFixed(1)})"
    />
  </mask>
</defs>`
    maskAttr = ` mask="url(#hintKnockout)"`
  }

  return `${maskDefs}
<g${maskAttr} opacity="${cardOpacity}">
  <g transform="rotate(${rotate}, ${cx.toFixed(1)}, ${cy.toFixed(1)})" style="overflow:visible">
${rows.join('\n')}
  </g>
</g>`
}

// ── buildHint：提示语文字（多行支持）────────────────────────────────────

function buildHint(width: number, height: number, opts: WatermarkOptions): string {
  const { hint, card } = opts
  if (!hint) return ''

  const hr          = hintRect(width, height, opts)!
  const color       = hint.color   ?? card.color ?? DEFAULT_CARD_COLOR
  const hintOpacity = hint.opacity ?? 1

  const totalH = hr.lines.length === 1
    ? hr.fontSize
    : hr.lineHeight * (hr.lines.length - 1) + hr.fontSize
  const topY = hr.cy - totalH / 2 + hr.fontSize / 2

  const textEls = hr.lines.map((line, i) => {
    const lineY = topY + i * hr.lineHeight
    return `  <text
    x="${hr.cx.toFixed(1)}"
    y="${lineY.toFixed(1)}"
    font-size="${hr.fontSize}"
    font-weight="${hr.fontWeight}"
    fill="${color}"
    font-family="sans-serif"
    text-anchor="middle"
    dominant-baseline="middle"
  >${escapeXml(line)}</text>`
  })

  return `<g transform="rotate(${hr.rotate}, ${hr.cx.toFixed(1)}, ${hr.cy.toFixed(1)})" opacity="${hintOpacity}">
${textEls.join('\n')}
</g>`
}

// ── 主入口 ──────────────────────────────────────────────────────────────────

export function generateWatermarkDataURL(
  width: number,
  height: number,
  opts: WatermarkOptions,
): string {
  const arrayPart = buildArray(width, height, opts)
  const hintPart  = buildHint(width, height, opts)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:hidden">
${arrayPart}
${hintPart}
</svg>`

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}
