import { useState, type FormEvent } from "react"
import { CONTACT_EMAIL, CONTACT_ACCESS_KEY } from "../../data"

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-slate-100 text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:border-blue-400 focus:bg-white outline-none transition-colors"

type Status = "idle" | "sending" | "sent" | "error"

export default function MailContent() {
  const [name, setName] = useState("")
  const [from, setFrom] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [botcheck, setBotcheck] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!CONTACT_ACCESS_KEY) {
      setStatus("error")
      setError("Email sending isn't configured yet.")
      return
    }
    setStatus("sending")
    setError("")

    const body = new FormData()
    body.append("access_key", CONTACT_ACCESS_KEY)
    body.append("from_name", name)
    body.append("email", from)
    body.append("subject", subject || "Contacto desde tu portafolio")
    body.append("message", message)
    body.append("botcheck", botcheck)

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body,
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setStatus("sent")
        setName("")
        setFrom("")
        setSubject("")
        setMessage("")
        setTimeout(() => setStatus("idle"), 6000)
      } else {
        setStatus("error")
        setError(data.message || "Couldn't send the email.")
      }
    } catch {
      setStatus("error")
      setError("Connection error. Try again.")
    }
  }

  return (
    <form
      onSubmit={handleSend}
      className="p-4 overflow-y-auto h-full space-y-3"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h2 className="text-sm font-bold text-slate-900">New message</h2>
        <span className="text-[10px] font-mono-code text-slate-400">
          ✉️ → {CONTACT_EMAIL}
        </span>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          To
        </span>
        <input
          value={CONTACT_EMAIL}
          readOnly
          className={`${inputCls} bg-slate-50 text-slate-500`}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Your name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="What's your name?"
          className={inputCls}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Your email
        </span>
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
          type="email"
          placeholder="you@email.com"
          className={inputCls}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Subject
        </span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What is it about?"
          className={inputCls}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Message
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Write your message..."
          className={`${inputCls} resize-none`}
        />
      </label>

      <input
        type="text"
        name="botcheck"
        value={botcheck}
        onChange={(e) => setBotcheck(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {status === "sending" ? (
            <>
              <i className="fa-solid fa-spinner animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane" />
              Send
            </>
          )}
        </button>

        {status === "sent" && (
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <i className="fa-solid fa-circle-check" />
            Message sent!
          </span>
        )}
        {status === "error" && (
          <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
            <i className="fa-solid fa-circle-xmark" />
            {error}
          </span>
        )}
      </div>

      <p className="text-[10px] text-slate-400 leading-relaxed">
        Your message is sent directly to Alexandra by email. Thanks for
        writing!
      </p>
    </form>
  )
}
