import { useEffect, useRef, useState } from "react"

const GRAVITY = 0.5
const JUMP_V = 11
const SPEED = 5

export default function GameContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<"ready" | "playing" | "over">("ready")
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let last = 0
    let frame = 0
    let player = { y: 0, vy: 0, w: 26, h: 26 }
    let obstacles: { x: number; w: number; h: number }[] = []
    let score = 0
    let best = 0

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const reset = () => {
      player = { y: 0, vy: 0, w: 26, h: 26 }
      obstacles = []
      score = 0
      frame = 0
    }

    const jump = () => {
      const s = stateRef.current
      if (s === "ready" || s === "over") {
        reset()
        setState("playing")
      }
      if (stateRef.current === "playing" && player.y === 0) player.vy = JUMP_V
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        jump()
      }
    }
    const onPointer = (e: PointerEvent) => {
      e.preventDefault()
      jump()
    }
    window.addEventListener("keydown", onKey)
    canvas.addEventListener("pointerdown", onPointer)

    const loop = (t: number) => {
      const dt = Math.min(1, last ? (t - last) / 16.7 : 1)
      last = t
      frame++
      const gy = canvas.height - 26

      if (stateRef.current === "playing") {
        player.vy -= GRAVITY * dt
        player.y += player.vy * dt
        if (player.y < 0) {
          player.y = 0
          player.vy = 0
        }

        if (frame % 70 === 0) {
          obstacles.push({
            x: canvas.width,
            w: 14 + Math.random() * 10,
            h: 20 + Math.random() * 26,
          })
        }
        obstacles = obstacles.filter((o) => o.x > -40)
        obstacles.forEach((o) => (o.x -= SPEED * dt))

        const px = 24
        const py = gy - player.y - player.h
        for (const o of obstacles) {
          if (
            px < o.x + o.w &&
            px + player.w > o.x &&
            py < gy - o.h + 2 &&
            py + player.h > gy - o.h - 2
          ) {
            if (score > best) best = score
            setState("over")
            break
          }
        }
        score += 0.05 * dt
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#cbd5e1"
      ctx.fillRect(0, gy, canvas.width, 2)
      ctx.fillStyle = "#a5b4fc"
      ctx.fillRect(0, gy + 2, canvas.width, canvas.height - gy - 2)

      ctx.fillStyle = "#6366f1"
      ctx.fillRect(24, gy - player.y - player.h, player.w, player.h)
      ctx.fillStyle = "#4338ca"
      ctx.fillRect(24 + 5, gy - player.y - player.h + 5, 7, 7)

      ctx.fillStyle = "#f43f5e"
      for (const o of obstacles) ctx.fillRect(o.x, gy - o.h, o.w, o.h)

      ctx.fillStyle = "#475569"
      ctx.font = "12px monospace"
      ctx.textAlign = "left"
      ctx.fillText(`Score: ${Math.floor(score)}`, 8, 16)

      if (stateRef.current !== "playing") {
        ctx.textAlign = "center"
        ctx.fillStyle = "#0f172a"
        ctx.font = "bold 14px 'Plus Jakarta Sans', sans-serif"
        ctx.fillText(
          stateRef.current === "ready" ? "Ready to play?" : "Game Over!",
          canvas.width / 2,
          canvas.height / 2 - 12,
        )
        ctx.font = "10px 'Plus Jakarta Sans', sans-serif"
        ctx.fillStyle = "#64748b"
        ctx.fillText(
          stateRef.current === "ready"
            ? "Tap or press space to jump"
            : "Tap to retry",
          canvas.width / 2,
          canvas.height / 2 + 10,
        )
        if (stateRef.current === "over") {
          ctx.fillStyle = "#f59e0b"
          ctx.fillText(
            `Best: ${Math.floor(best)}`,
            canvas.width / 2,
            canvas.height / 2 + 28,
          )
        }
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("keydown", onKey)
      canvas.removeEventListener("pointerdown", onPointer)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-50 to-sky-50 cursor-pointer select-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
