"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Megaphone, FolderOpen, Users, Scale, Settings } from "lucide-react"

const sidebarItems = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard, href: "/dashboard/home" },
  { id: "calls", label: "Convocatorias", icon: Megaphone, href: "/dashboard/calls" },
  { id: "proyectos", label: "Proyectos", icon: FolderOpen, href: "/proyectos" },
  { id: "participantes", label: "Participantes", icon: Users, href: "/participantes" },
  { id: "jurados", label: "Jurados", icon: Scale, href: "/jurados" },
  { id: "configuracion", label: "Configuración", icon: Settings, href: "/configuracion" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
       {/* Logo/Brand */}
      <div className="h-16 px-6 border-b border-sidebar-border flex items-center gap-2">
        <img src={"/logo-upds-innova.png"} alt={"Logo"} className="w-8" />
        <h1 className="text-lg font-bold text-sidebar-foreground">
          Innotech
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
