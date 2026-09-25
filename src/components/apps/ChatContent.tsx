import { useState, useRef, useEffect } from "react"
import { getBotAnswer, QUICK_QUESTIONS } from "../../data"
import { supabase, isSupabaseConfigured } from "../../lib/supabase"
import { tr } from "../../lib/translate"
import type { ChatMsg, WindowProps } from "../../types"
import RichText from "./RichText"

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export default function ChatContent({ onOpen }: WindowProps) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      text: "Hi! I'm the virtual assistant for Alexandra's portfolio. Tap a quick question or type a message.",
      sender: "bot",
      time: now(),
      suggestions: [
        "Who is Alexandra?",
        "What is your stack?",
        "How can I contact you?",
      ],
    },
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const overridesRef = useRef<Record<string, string>>({})

  useEffect(() => {
    ;(async () => {
      if (!isSupabaseConfigured()) return
      const [cfgRes, techRes] = await Promise.all([
        supabase!.from("content_settings").select("key, value"),
        supabase!.from("technologies").select("name").order("id"),
      ])
      const map: Record<string, string> = {}
      for (const r of cfgRes.data ?? []) map[r.key] = r.value ?? ""
      for (const k of ["bio", "stack", "freelance", "contact", "default"]) {
        if (map[k]) map[k] = tr(map[k])
      }
      const parse = <T,>(key: string): T[] => {
        try {
          const v = JSON.parse(map[key] ?? "")
          return Array.isArray(v) ? (v as T[]) : []
        } catch {
          return []
        }
      }
      const education = parse<{ title: string; place: string; detail: string }>(
        "about.education",
      )
      const languages = parse<{ name: string; level: string }>(
        "about.languages",
      )
      const courses = parse<{
        title: string
        issuer: string
        date: string
        url: string
      }>("about.courses")
      if (education.length) {
        map["answer.educacion"] =
          "## Education\n" +
          education
            .map((e) => `- **${tr(e.title)}**\n- ${tr(e.place)} · ${tr(e.detail)}`)
            .join("\n")
      }
      if (languages.length) {
        map["answer.idiomas"] =
          "## Languages\n" +
          languages.map((l) => `- **${tr(l.name)}** — ${tr(l.level)}`).join("\n")
      }
      if (courses.length) {
        map["answer.cursos"] =
          "## Courses\n" +
          courses
            .map((c) => `- **${tr(c.title)}** — ${tr(c.issuer)} (${c.date})`)
            .join("\n")
      }
      const techNames = (techRes.data as { name: string }[] | null) ?? []
      if (!map["stack"] && techNames.length) {
        map["stack"] =
          "## Stack\n" + techNames.map((t) => `- **${t.name}**`).join("\n")
      }
      const contactFields = (
        [
          ["Email", map["about.email"] ?? ""],
          ["LinkedIn", map["about.linkedin"] ?? ""],
          ["GitHub", map["about.github"] ?? ""],
          ["Instagram", map["about.instagram"] ?? ""],
        ] as [string, string][]
      ).filter(([, v]) => v)
      if (!map["contact"] && contactFields.length) {
        map["contact"] =
          "## Contact\n" +
          contactFields.map(([label, v]) => `- **${label}:** ${v}`).join("\n")
      }
      overridesRef.current = map
    })()
  }, [])

  const send = (q: string) => {
    if (!q.trim() || typing) return
    setMsgs((m) => [...m, { text: q, sender: "user", time: now() }])
    setInput("")
    setTyping(true)
    setTimeout(() => {
      const a = getBotAnswer(q, overridesRef.current)
      setMsgs((m) => [
        ...m,
        {
          text: a.text,
          sender: "bot",
          time: now(),
          suggestions: a.suggestions,
          showMail: a.showMail,
        },
      ])
      setTyping(false)
    }, 650)
  }

  useEffect(() => {
    boxRef.current?.scrollTo({
      top: boxRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [msgs, typing])

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div
        ref={boxRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 text-xs touch-scroll"
      >
        {msgs.map((m, i) =>
          m.sender === "user" ? (
            <div key={i} className="flex flex-col items-end gap-0.5">
              <div className="bg-blue-600 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[80%] leading-relaxed shadow-sm text-xs sm:text-xs">
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 pr-1">{m.time}</span>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow-sm">
                AI
              </div>
              <div className="max-w-[88%] sm:max-w-[85%] space-y-1.5">
                <div className="bg-slate-100 px-3.5 py-2.5 rounded-2xl rounded-tl-none text-slate-800 leading-relaxed shadow-sm border border-slate-200/60 dark:border-slate-700/60">
                  <RichText text={m.text} />
                </div>

                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-200 active:scale-95 transition-all shadow-xs"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {m.showMail && (
                  <button
                    onClick={() => onOpen?.("mail")}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm font-medium"
                  >
                    <i className="fa-solid fa-envelope" />
                    Open contact form
                  </button>
                )}

                <span className="block text-[9px] text-slate-400 pl-1">
                  {m.time}
                </span>
              </div>
            </div>
          ),
        )}

        {typing && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
              AI
            </div>
            <div className="bg-slate-100 px-3.5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 border border-slate-200/60 dark:border-slate-700/60">
              <span
                className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-3 sm:px-4 py-2 border-t border-slate-200/80 bg-slate-50/50 flex-shrink-0">
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
          Quick questions:
        </p>
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar touch-scroll gap-1.5 pb-0.5">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q.label}
              onClick={() => send(q.q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-medium whitespace-nowrap active:scale-95 transition-all flex-shrink-0"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-t border-slate-200/80 bg-white/90 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-sm sm:text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:border-blue-400 transition-colors outline-none"
        />
        <button
          onClick={() => send(input)}
          className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform text-sm flex-shrink-0 shadow-sm"
          aria-label="Send message"
        >
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  )
}
