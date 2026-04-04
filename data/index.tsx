import {IconBolt, IconBrain, IconHome, IconMessage, IconPhoto, IconUser} from "@tabler/icons-react"

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
    icon: <IconUser className="w-6 h-6" />,
    label: "Profiles",
    route: "/profiles"
  },
  {
    icon: <IconMessage className="w-6 h-6" />,
    label: "Conversations",
    route: "/conversations"
  },
  {
    icon: <IconBolt className="w-6 h-6" />,
    label: "Quick Replies",
    route: "/quick-replies"
  },
  {
    icon: <IconBrain className="w-6 h-6" />,
    label: "AI Review",
    route: "/ai-review"
  }
]