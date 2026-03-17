// Vitest runs in jsdom; add minimal DOM/canvas shims used by Chart.js.
import { vi } from 'vitest'

// Chart.js expects canvas context. For unit tests we can stub it.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    canvas: {},
    // minimal API surface used by Chart.js in tests
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    clip: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  })),
})

// Make requestAnimationFrame deterministic for counter animations.
// Use setTimeout to avoid synchronous recursion and advance time each frame.
let __rafTime = 0
;(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
  __rafTime += 16
  return setTimeout(() => cb(__rafTime), 0) as unknown as number
}
;(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id as any)


