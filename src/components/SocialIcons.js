import React from "react"
import { IconGithub, IconPOA, IconTelegram, IconTwitter } from "./social-icons"
import { Link } from  'react-router-dom'

export const SocialIcons = () => {
  const socialItems = [
    {
      icon: <IconPOA />,
      link: "https://poa.network",
    },
    {
      icon: <IconTwitter />,
      link: "https://twitter.com/poanetwork",
    },
    {
      icon: <IconTelegram />,
      link: "https://t.me/poa_network",
    },
    {
      icon: <IconGithub />,
      link: "https://github.com/poanetwork/token-bridge",
    },
  ]

  return (
    <div className="social-icons">
      {socialItems.map((item, index) => {
        return (
          <Link key={index} to={item.link} className="social-icons-item">
            {item.icon}
          </Link>
        )
      })}
    </div>
  )
}
