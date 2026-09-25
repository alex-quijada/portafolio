import { useEffect, useState } from "react"

function isSpanish(): boolean {
  if (typeof document === "undefined") return false
  const html = document.documentElement
  const lang = (html.getAttribute("lang") || "").toLowerCase()
  const isTranslated =
    html.classList.contains("translated-ltr") ||
    html.classList.contains("translated-rtl")
  const bodyText = document.body?.innerText || ""

  return (
    lang.startsWith("es") ||
    isTranslated ||
    bodyText.toLowerCase().includes("bienvenido") ||
    bodyText.toLowerCase().includes("sobre mí")
  )
}

export default function DesktopHero({ dark }: { dark?: boolean }) {
  const [word, setWord] = useState(() => (isSpanish() ? "Portafolio" : "Portfolio"))

  useEffect(() => {
    const checkLang = () => {
      setWord(isSpanish() ? "Portafolio" : "Portfolio")
    }

    checkLang()

    const observer = new MutationObserver(checkLang)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "class"],
      subtree: true,
      childList: true,
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 opacity-75 sm:opacity-90 px-4 text-center select-none">
      <p
        className={`pointer-events-auto text-[10px] sm:text-xs font-mono-code tracking-widest uppercase mb-1.5 sm:mb-2 transition-all duration-300 hover:tracking-[0.3em] cursor-default ${
          dark ? "text-slate-300" : "text-slate-500"
        }`}
      >
        welcome to my
      </p>
      <h1
        translate="no"
        className={`notranslate pointer-events-auto font-serif-title italic text-4xl sm:text-7xl md:text-8xl tracking-tight font-normal leading-[1.05] whitespace-nowrap cursor-default ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        {word.split("").map((char, i) => (
          <span
            key={`${word}-${i}`}
            className={`inline-block transition-all duration-200 ease-out hover:scale-125 sm:hover:scale-135 hover:-translate-y-1.5 sm:hover:-translate-y-3 hover:font-bold origin-bottom ${
              dark
                ? "text-white hover:text-white"
                : "text-slate-900 hover:text-black"
            }`}
          >
            {char}
          </span>
        ))}
      </h1>
      <p
        className={`mt-4 sm:mt-8 text-[10px] sm:text-xs font-mono-code px-3 py-1 rounded-full shadow-sm max-w-[90vw] truncate border ${
          dark
            ? "text-slate-200 bg-slate-900/80 border-slate-700/80"
            : "text-slate-600 bg-white/90 border-slate-200/80"
        }`}
      >
        UX/UI Designer & Creative Technologist
      </p>
    </div>
  )
}
