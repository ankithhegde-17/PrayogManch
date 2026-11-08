import { useEffect, useRef } from 'react'

// Site-wide cursor-responsive wireframe grid, mounted once in the app layout.
//
// The canvas is fixed to the viewport (so it stays cheap on long pages) and the grid is drawn
// offset by the scroll position, so it moves with the document like a page background.
// Pointer coordinates are viewport coordinates, which match the canvas at every scroll position.

// Each point stores only its displacement from its resting grid position, so scrolling can
// move the grid without disturbing the spring physics.
type Point = { dx: number; dy: number; vx: number; vy: number }

const SPACING = 76
const RADIUS = 170
const PUSH = 10 // max displacement in px: a subtle bend
const STIFFNESS = 0.06 // soft spring for a smooth, slow ease back to rest
const DAMPING = 0.8
// Light cool grey: about 6-7 grey levels of contrast against the off-white page. Clearly visible
// but quiet. (~3 levels disappeared on typical screens; ~10 competed with content.)
const STROKE = 'rgba(214, 216, 224, 0.22)'
const LINE_WIDTH = 1 // thinner lines blur to near-nothing at 100-125% display scaling

const restingPoint = (): Point => ({ dx: 0, dy: 0, vx: 0, vy: 0 })

export function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const root = document.documentElement

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let width = 0
    let height = 0
    let columns = 0
    let rows = 0
    let points: Point[] = []
    let firstRow = 0 // document row index shown at the top of the viewport
    let offsetY = 0 // sub-row scroll offset in px, always in (-SPACING, 0]
    let pointer: { x: number; y: number } | null = null
    let frame = 0

    // Animate only for a precise pointer, with motion allowed and the tab visible. Otherwise
    // the grid is drawn statically and only redrawn on scroll or resize.
    const animating = () => !document.hidden && !reducedMotion.matches && finePointer.matches
    const homeY = (row: number) => row * SPACING + offsetY

    const draw = () => {
      context.clearRect(0, 0, width, height)
      context.beginPath()
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const index = row * columns + column
          const point = points[index]
          const x = column * SPACING + point.dx
          const y = homeY(row) + point.dy
          if (column < columns - 1) {
            const next = points[index + 1]
            context.moveTo(x, y)
            context.lineTo((column + 1) * SPACING + next.dx, homeY(row) + next.dy)
          }
          if (row < rows - 1) {
            const next = points[index + columns]
            context.moveTo(x, y)
            context.lineTo(column * SPACING + next.dx, homeY(row + 1) + next.dy)
          }
        }
      }
      context.strokeStyle = STROKE
      context.lineWidth = LINE_WIDTH
      context.stroke()
    }

    // Spring step. Stops scheduling itself once the grid is at rest and the pointer has left,
    // so an idle page costs nothing.
    const tick = () => {
      frame = 0
      let moving = false
      for (let index = 0; index < points.length; index++) {
        const point = points[index]
        let pushX = 0
        let pushY = 0
        if (pointer) {
          const dx = (index % columns) * SPACING - pointer.x
          const dy = homeY(Math.floor(index / columns)) - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance > 0 && distance < RADIUS) {
            const influence = (1 - distance / RADIUS) ** 2
            pushX = (dx / distance) * influence * PUSH
            pushY = (dy / distance) * influence * PUSH
          }
        }
        point.vx = (point.vx + (pushX - point.dx) * STIFFNESS) * DAMPING
        point.vy = (point.vy + (pushY - point.dy) * STIFFNESS) * DAMPING
        point.dx += point.vx
        point.dy += point.vy
        if (Math.abs(point.dx) > 0.01 || Math.abs(point.dy) > 0.01 || Math.abs(point.vx) > 0.01 || Math.abs(point.vy) > 0.01) moving = true
        else Object.assign(point, restingPoint())
      }
      draw()
      if (animating() && (moving || pointer)) frame = requestAnimationFrame(tick)
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(animating() ? tick : () => { frame = 0; draw() })
    }

    // Reset to a static grid when motion becomes unavailable (reduced motion, touch, hidden tab).
    const onEnvironmentChange = () => {
      cancelAnimationFrame(frame)
      frame = 0
      if (!animating()) {
        pointer = null
        for (const point of points) Object.assign(point, restingPoint())
      }
      schedule()
    }

    // Align the grid to the scroll position. Whole rows that scroll past are rotated through the
    // point buffer so a distortion stays attached to the same grid lines instead of jumping.
    const syncScroll = () => {
      const scrollY = window.scrollY
      const nextFirstRow = Math.floor(scrollY / SPACING)
      offsetY = nextFirstRow * SPACING - scrollY
      const shift = nextFirstRow - firstRow
      firstRow = nextFirstRow
      if (!shift) return
      if (Math.abs(shift) >= rows) {
        points = Array.from({ length: columns * rows }, restingPoint)
        return
      }
      const moved = Math.abs(shift) * columns
      const fresh = Array.from({ length: moved }, restingPoint)
      points = shift > 0 ? [...points.slice(moved), ...fresh] : [...fresh, ...points.slice(0, points.length - moved)]
    }

    const resize = () => {
      width = root.clientWidth // excludes the scrollbar, matching the fixed canvas box
      height = window.innerHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      columns = Math.ceil(width / SPACING) + 1
      rows = Math.ceil(height / SPACING) + 2 // +1 for the partially scrolled row at the bottom
      points = Array.from({ length: columns * rows }, restingPoint)
      firstRow = Math.floor(window.scrollY / SPACING)
      syncScroll()
      draw()
    }

    const onScroll = () => {
      syncScroll()
      schedule()
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!animating() || event.pointerType !== 'mouse') return
      pointer = { x: event.clientX, y: event.clientY }
      schedule()
    }
    const onPointerLeave = () => {
      pointer = null
      schedule()
    }
    // The page width can change without a window resize (e.g. a scrollbar appearing after a
    // route change makes the page taller), so watch the root element's box too.
    const resizeObserver = new ResizeObserver(resize)

    resizeObserver.observe(root)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    root.addEventListener('pointermove', onPointerMove, { passive: true })
    root.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onEnvironmentChange)
    reducedMotion.addEventListener('change', onEnvironmentChange)
    finePointer.addEventListener('change', onEnvironmentChange)
    resize()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onEnvironmentChange)
      reducedMotion.removeEventListener('change', onEnvironmentChange)
      finePointer.removeEventListener('change', onEnvironmentChange)
    }
  }, [])

  return <canvas ref={canvasRef} className="page-grid" aria-hidden="true" />
}
