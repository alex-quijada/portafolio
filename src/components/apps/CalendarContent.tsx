import { useState } from "react"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function CalendarContent() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const startDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isToday = (d: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === d

  const go = (dir: -1 | 1) => {
    let m = month + dir
    let y = year
    if (m < 0) {
      m = 11
      y--
    }
    if (m > 11) {
      m = 0
      y++
    }
    setMonth(m)
    setYear(y)
  }

  return (
    <div className="p-3 overflow-y-auto h-full flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-900">
          {MONTHS[month]}{" "}
          <span className="text-slate-400 font-semibold">{year}</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => go(-1)}
            className="w-6 h-6 rounded-lg hover:bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] transition-colors"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button
            onClick={() => {
              setMonth(today.getMonth())
              setYear(today.getFullYear())
            }}
            className="text-[9px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-semibold"
          >
            Today
          </button>
          <button
            onClick={() => go(1)}
            className="w-6 h-6 rounded-lg hover:bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] transition-colors"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="text-[9px] font-bold uppercase text-slate-400 tracking-wider py-0.5"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) =>
          d === null ? (
            <div key={i} className="aspect-square rounded-lg" />
          ) : (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-medium transition-colors ${
                isToday(d)
                  ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-200"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {d}
            </div>
          ),
        )}
      </div>

      <div className="mt-auto pt-2 text-[9px] text-slate-400 flex items-center gap-1">
        <i className="fa-solid fa-circle-info" />
        Month view · the day in blue is today
      </div>
    </div>
  )
}