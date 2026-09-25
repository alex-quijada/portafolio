export const inputCls =
  "w-full px-3 py-2 rounded-lg bg-white text-xs border border-slate-200 focus:border-blue-400 outline-none transition-colors"

export const labelCls =
  "block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"

export const btnPrimary =
  "px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"

export const btnDanger =
  "px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-semibold hover:bg-rose-100 transition-colors"

export const btnGhost =
  "px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold hover:bg-slate-200 transition-colors"

export function dbErrorMsg(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err)
  const table = m.match(/table 'public\.(\w+)'/)?.[1]
  if (m.includes("Could not find the table") || m.includes("schema cache")) {
    return `Falta la tabla "${table ?? "…"}" en Supabase. Ejecuta el script de supabase/schema.sql en el SQL Editor y vuelve a intentar.`
  }
  return m
}
