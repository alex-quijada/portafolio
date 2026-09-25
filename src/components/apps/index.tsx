import type { ComponentType } from "react"
import type { WindowProps } from "../../types"

import FileExplorerContent from "./FileExplorerContent"
import AboutContent from "./AboutContent"
import ChatContent from "./ChatContent"
import MusicContent from "./MusicContent"
import TrashContent from "./TrashContent"
import ProfileContent from "./ProfileContent"
import MailContent from "./MailContent"
import CalendarContent from "./CalendarContent"
import GameContent from "./GameContent"
import AdminContent from "./AdminContent"
import WeatherContent from "./WeatherContent"

const explorer =
  (initialFolder: "projects" | "university" | "ux" | "personal") =>
  (props: WindowProps) => (
    <FileExplorerContent initialFolder={initialFolder} {...props} />
  )

export const WIN_CONTENT: Record<string, ComponentType<WindowProps>> = {
  projects: explorer("projects"),
  about: AboutContent,
  chat: ChatContent,
  music: MusicContent,
  university: explorer("university"),
  ux: explorer("ux"),
  personal: explorer("personal"),
  trash: TrashContent,
  profile: ProfileContent,
  mail: MailContent,
  calendar: CalendarContent,
  game: GameContent,
  admin: AdminContent,
  weather: WeatherContent,
}
