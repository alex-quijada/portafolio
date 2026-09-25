import type { ReactNode } from "react"

const URL_RE = /^(https?:\/\/[^\s]+|mailto:[^\s]+|[^\s@]+@[^\s@]+\.[^\s]+)$/
const SPLIT_RE = /(https?:\/\/[^\s]+|mailto:[^\s]+|[^\s@]+@[^\s@]+\.[^\s@]+)/g

function inlineNodes(text: string, keyBase: string): ReactNode[] {
  return text.split(SPLIT_RE).map((seg, i) => {
    const key = `${keyBase}-${i}`
    if (URL_RE.test(seg)) {
      const href =
        seg.startsWith("http") || seg.startsWith("mailto:")
          ? seg
          : `mailto:${seg}`
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline break-all"
        >
          {seg}
        </a>
      )
    }
    return seg.split(/\*\*(.+?)\*\*/g).map((b, j) =>
      j % 2 === 1 ? (
        <strong key={`${key}-${j}`} className="font-semibold">
          {b}
        </strong>
      ) : (
        <span key={`${key}-${j}`}>{b}</span>
      ),
    )
  })
}

export default function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  let bullets: ReactNode[] = []
  let k = 0
  const flush = () => {
    if (bullets.length) {
      nodes.push(
        <ul key={`ul-${k++}`} className="list-disc pl-4 space-y-0.5">
          {bullets}
        </ul>,
      )
      bullets = []
    }
  }
  text.split("\n").forEach((line) => {
    if (line.startsWith("## ")) {
      flush()
      nodes.push(
        <p key={`h-${k++}`} className="font-bold text-slate-900">
          {inlineNodes(line.slice(3), `h${k}`)}
        </p>,
      )
    } else if (line.startsWith("- ")) {
      bullets.push(
        <li key={`li-${k++}`}>{inlineNodes(line.slice(2), `li${k}`)}</li>,
      )
    } else if (line.trim()) {
      flush()
      nodes.push(<p key={`p-${k++}`}>{inlineNodes(line, `p${k}`)}</p>)
    }
  })
  flush()
  return <div className="space-y-1">{nodes}</div>
}