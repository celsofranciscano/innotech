"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard,FolderOpen, Users, Scale, Settings } from "lucide-react"

const sidebarItems = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard, href: "/dashboard/settings" },
  { id: "calls", label: "Concurso", icon: Users, href:  "/dashboard/settings/calls" },
  { id: "users", label: "Usuarios", icon: Users, href: "/dashboard/settings/users" },
  { id: "privileges", label: "Privilegios", icon: FolderOpen, href: "/dashboard/settings/privileges" },
  { id: "types", label: "Tipo de proyectos", icon: FolderOpen, href: "/dashboard/settings/types" },
  { id: "status", label: "Estado de proyectos", icon: FolderOpen, href: "/dashboard/settings/status" },
  { id: "categories", label: "Categorias", icon: FolderOpen, href: "/dashboard/settings/categories" },
  { id: "jurados", label: "Jurados", icon: Scale, href: "/jurados" },
  { id: "configuracion", label: "Configuración", icon: Settings, href: "/configuracion" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex w-64 bg-card  shadow-md flex-col">
       {/* Logo/Brand */}
      <div className="h-16 px-6 border-b border-sidebar-border flex items-center gap-2">
        <img src={"/logo-upds-innova.png"} alt={"Logo"} className="w-8" />
        <h1 className="text-lg font-bold text-sidebar-foreground">
          UPDS INNOVA
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
