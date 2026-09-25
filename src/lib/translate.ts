// Pequeño convertidor español -> inglés para el contenido que llega de la
// base de datos (About Me, Perfil y respuestas del asistente). Es una
// conversión por diccionario (best-effort): reemplaza frases conocidas y
// palabras comunes; lo que no esté cubierto se deja igual.

const PHRASES: [string, string][] = [
  ["licenciatura en informática", "Bachelor's Degree in Computer Science"],
  ["universidad de oriente", "Universidad de Oriente"],
  ["en curso", "in progress"],
  ["sobre mí", "about me"],
  ["desarrolladora frontend", "Frontend Developer"],
  ["prácticas profesionales", "professional internships"],
  ["con foco en", "focused on"],
  ["proyectos personales y universitarios", "personal and university projects"],
  ["diseño de interfaces", "interface design"],
  ["desarrollo web", "web development"],
  ["proyectos personales", "personal projects"],
  ["proyectos universitarios", "university projects"],
  ["portafolio de proyectos", "portfolio of projects"],
  ["experiencia en", "experience in"],
  ["combino", "I combine"],
  ["cuento con", "I have"],
  ["ubicación", "location"],
  ["asistente virtual", "virtual assistant"],
  ["experiencia del usuario", "user experience"],
  ["interfaces de usuario", "user interfaces"],
  ["creación de prototipos", "prototyping"],
  ["investigación de usuarios", "user research"],
  ["aspectos básicos", "fundamentals"],
  ["primeros pasos", "first steps"],
  ["llevar a cabo", "carry out"],
  ["alta fidelidad", "high fidelity"],
  ["baja fidelidad", "low fidelity"],
  ["diseños de alta fidelidad", "high-fidelity designs"],
  ["esquemas de página", "page wireframes"],
  ["en la barra inferior", "in the bottom bar"],
]

const WORDS: [string, string][] = [
  ["estudiante", "student"],
  ["universidad", "university"],
  ["informática", "Computer Science"],
  ["español", "Spanish"],
  ["nativo", "Native"],
  ["inglés", "English"],
  ["curso", "course"],
  ["cursos", "courses"],
  ["certificaciones", "certifications"],
  ["diseño", "design"],
  ["diseñador", "designer"],
  ["diseñadora", "designer"],
  ["tecnología", "technology"],
  ["formación", "education"],
  ["educación", "education"],
  ["idioma", "language"],
  ["idiomas", "languages"],
  ["contacto", "contact"],
  ["proyecto", "project"],
  ["trabajo", "work"],
  ["disponible", "available"],
  ["título", "title"],
  ["lugar", "place"],
  ["detalle", "detail"],
  ["nivel", "level"],
  ["emisor", "issuer"],
  ["fecha", "date"],
  ["mensaje", "message"],
  ["correo", "email"],
  ["volver", "back"],
  ["buscar", "search"],
  ["guardar", "save"],
  ["agregar", "add"],
  ["eliminar", "delete"],
  ["reproduciendo", "playing"],
  ["canción", "song"],
  ["canciones", "songs"],
  ["lista", "queue"],
  ["pausa", "pause"],
  ["todavía", "yet"],
  ["aún", "still"],
  ["foco", "focus"],
  ["universitarios", "university"],
  ["personales", "personal"],
  ["donde", "where"],
  ["en", "in"],
  ["con", "with"],
  ["de", "of"],
  ["y", "and"],
  ["el", "the"],
  ["la", "the"],
  ["los", "the"],
  ["las", "the"],
  ["un", "a"],
  ["una", "a"],
]

const WORD_RE = /[A-Za-zÁÉÍÓÚáéíóúñÑ]/
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const PH = "\u0001"

export function tr(text: string): string {
  if (!text) return text
  const hold: string[] = []
  let out = text

  for (const [es, en] of PHRASES) {
    out = out.replace(new RegExp(esc(es), "gi"), () => {
      hold.push(en)
      return `${PH}${hold.length - 1}${PH}`
    })
  }

  for (const [es, en] of WORDS) {
    out = out.replace(
      new RegExp(
        `(?<!${WORD_RE.source})${esc(es)}(?!${WORD_RE.source})`,
        "gi",
      ),
      () => en,
    )
  }

  out = out.replace(new RegExp(`${PH}(\\d+)${PH}`, "g"), (_m, i) => {
    return hold[Number(i)] ?? ""
  })
  return out
}