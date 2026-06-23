export interface CardOptions {
  /** 姓名 */
  name: string
  /** 工号 */
  id: string
  /** 姓名与工号之间的水平间距，默认 8 */
  gapX?: number
  /** 文字颜色，默认 'rgba(217, 227, 255, 0.6)'（#D9E3FF 60%） */
  color?: string
  /** 字号（px），默认 14 */
  fontSize?: number
  /** 识别卡透明度 0~1，默认 1 */
  opacity?: number
}

export interface RowOptions {
  /** 识别卡之间的水平间距，默认 80 */
  cardGap?: number
}

export interface ArrayOptions {
  /** 行之间的垂直间距，默认 60 */
  rowGap?: number
  /** 每行相对上一行的递增水平偏移，默认 20 */
  rowOffsetX?: number
  /** 整体旋转角度（deg），默认 -38 */
  rotate?: number
}

export interface HintOptions {
  /**
   * 提示文字内容，支持多行：
   * - 传数组：['第一行', '第二行']
   * - 传字符串含 \n：'第一行\n第二行'
   */
  content: string | string[]
  /** 字号（px），默认 24 */
  fontSize?: number
  /** 字重，默认 'bold' */
  fontWeight?: string | number
  /** 文字颜色，默认同 card.color */
  color?: string
  /** 旋转角度（deg），默认 -38 */
  rotate?: number
  /** 背景圆角（px），默认 10 */
  borderRadius?: number
  /** 水平内边距（px），默认 40 */
  paddingX?: number
  /** 垂直内边距（px），默认 20 */
  paddingY?: number
  /** 行高（px），默认 fontSize * 1.6，多行时生效 */
  lineHeight?: number
  /** 提示语透明度 0~1，默认 1 */
  opacity?: number
}

export interface WatermarkOptions {
  /** 识别卡配置（姓名 + 工号） */
  card: CardOptions
  /** 行配置 */
  row?: RowOptions
  /** 阵列配置 */
  array?: ArrayOptions
  /** 提示语配置（可选，居中出现一次） */
  hint?: HintOptions
  /** 整体水印层透明度 0~1，默认 0.1 */
  opacity?: number
  /** 水印层 z-index，默认 2147483647 */
  zIndex?: number
}
