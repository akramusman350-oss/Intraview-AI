"use client"

import Image from "next/image"
import { User, Video, BookOpen, Settings, CheckCircle } from "lucide-react"

interface IntraViewSidebarProps {
  currentView: string
  onNavigate: (view: string) => void
  profileCompleted?: boolean
}

export function IntraViewSidebar({ currentView, onNavigate, profileCompleted }: IntraViewSidebarProps) {
  const menuItems = [
    { id: "profile", label: "Profile Setup", icon: User },
    { id: "interviews", label: "Interviews", icon: Video },
    { id: "recommendations", label: "Recommendations", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="w-64 bg-card border-r border-border p-6 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Image src="/logo-01.png" alt="IntraView AI" width={32} height={32} className="w-8 h-8 object-contain" />
        <span className="font-bold text-lg text-foreground">IntraView AI</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full px-4 py-3 rounded-lg font-medium text-left flex items-center justify-between transition ${
                isActive ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {item.id === "interviews" && profileCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
