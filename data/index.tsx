import {IconBrain, IconHome, IconMessage, IconPhoto} from "@tabler/icons-react"

export const navbarLinks = [
  {
    icon: <IconHome className="w-6 h-6" />,
    label: "Dashboard",
    route: "/dashboard"
  },
  {
    icon: <IconPhoto className="w-6 h-6" />,
    label: "Photos",
    route: "/photos"
  },
  {
    icon: <IconMessage className="w-6 h-6" />,
    label: "Conversations",
    route: "/conversations"
  },
  {
    icon: <IconBrain className="w-6 h-6" />,
    label: "AI Review",
    route: "/ai-review"
  }
]