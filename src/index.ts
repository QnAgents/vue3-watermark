import type { App, DirectiveBinding, ObjectDirective } from 'vue'
import type { WatermarkOptions } from './types'
import { generateWatermarkDataURL } from './generateSVG'

interface WatermarkState {
  overlayEl: HTMLDivElement
  observer: ResizeObserver
}

const stateMap = new WeakMap<HTMLElement, WatermarkState>()

function applyWatermark(el: HTMLElement, opts: WatermarkOptions): void {
  const width   = el.offsetWidth  || el.clientWidth  || 300
  const height  = el.offsetHeight || el.clientHeight || 300
  const opacity = opts.opacity ?? 0.1
  const zIndex  = opts.zIndex  ?? 2147483647

  const dataUrl = generateWatermarkDataURL(width, height, opts)

  const existing = stateMap.get(el)
  if (existing) {
    setOverlayStyle(existing.overlayEl, dataUrl, opacity, zIndex)
    return
  }

  if (getComputedStyle(el).position === 'static') {
    el.style.position = 'relative'
  }
  // isolation: isolate 强制建立独立 stacking context
  // 子元素 z-index 竞争被锁定在此 context 内，overlay 永远最高
  el.style.setProperty('isolation', 'isolate', 'important')

  const overlayEl = document.createElement('div')
  overlayEl.setAttribute('aria-hidden', 'true')
  overlayEl.dataset.watermark = ''
  setOverlayStyle(overlayEl, dataUrl, opacity, zIndex)
  el.appendChild(overlayEl)

  const observer = new ResizeObserver(() => applyWatermark(el, opts))
  observer.observe(el)

  stateMap.set(el, { overlayEl, observer })
}

function setOverlayStyle(
  div: HTMLDivElement,
  dataUrl: string,
  opacity: number,
  zIndex: number,
): void {
  const s = div.style
  s.setProperty('position',          'absolute',          'important')
  s.setProperty('inset',             '0',                 'important')
  s.setProperty('pointer-events',    'none',              'important')
  s.setProperty('z-index',           String(zIndex),      'important')
  s.setProperty('opacity',           String(opacity),     'important')
  s.setProperty('background-image',  `url("${dataUrl}")`, 'important')
  s.setProperty('background-size',   '100% 100%',         'important')
  s.setProperty('background-repeat', 'no-repeat',         'important')
}

function removeWatermark(el: HTMLElement): void {
  const state = stateMap.get(el)
  if (!state) return
  state.observer.disconnect()
  state.overlayEl.remove()
  stateMap.delete(el)
}

function resolveOptions(binding: DirectiveBinding): WatermarkOptions | null {
  const val = binding.value
  if (!val || typeof val !== 'object') return null
  return val as WatermarkOptions
}

export const vWatermark: ObjectDirective<HTMLElement, WatermarkOptions> = {
  mounted(el, binding) {
    const opts = resolveOptions(binding)
    if (opts) applyWatermark(el, opts)
  },
  updated(el, binding) {
    const opts = resolveOptions(binding)
    if (opts) applyWatermark(el, opts)
  },
  unmounted(el) {
    removeWatermark(el)
  },
}

export const watermarkPlugin = {
  install(app: App) {
    app.directive('watermark', vWatermark)
  },
}

export type { WatermarkOptions } from './types'
