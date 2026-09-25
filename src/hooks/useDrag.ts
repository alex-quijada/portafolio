import { useCallback } from "react"

export function useDrag(
  onMove: (dx: number, dy: number) => void,
  onStart?: () => void,
) {
  return useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onStart?.()
      let px = e.clientX,
        py = e.clientY
      const move = (me: MouseEvent) => {
        onMove(me.clientX - px, me.clientY - py)
        px = me.clientX
        py = me.clientY
      }
      const up = () => {
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
      }
      window.addEventListener("mousemove", move)
      window.addEventListener("mouseup", up)
    },
    [onMove, onStart],
  )
}
