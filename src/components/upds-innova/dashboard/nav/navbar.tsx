"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProfileCard } from "@/components/upds-innova/dashboard/nav/profile-card";
import { ModeToggle } from "@/components/dark-mode-toggle";
import {
  Bell,
  Menu,
  Award,
  LayoutDashboard,
  Megaphone,
  FolderOpen,
  Users,
  Scale,
  Settings,
} from "lucide-react";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  {
    id: "convocatorias",
    label: "Convocatorias",
    icon: Megaphone,
    href: "/convocatorias",
  },
  { id: "proyectos", label: "Proyectos", icon: FolderOpen, href: "/proyectos" },
  {
    id: "participantes",
    label: "Participantes",
    icon: Users,
    href: "/participantes",
  },
  { id: "jurados", label: "Jurados", icon: Scale, href: "/jurados" },
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    href: "/configuracion",
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section - Logo and mobile menu */}
        <div className="flex items-center space-x-4">
          {/* Desktop Logo */}
          <div className="flex md:hidden items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">UPDS</h1>
              <p className="text-xs text-muted-foreground">INNOVA</p>
            </div>
          </div>
        </div>

        {/* Right section - Search, notifications, theme toggle, user */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Theme toggle */}
          <ModeToggle />

          {/* User navigation */}
          <ProfileCard />

          {/* Mobile menu trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold">UPDS</h1>
                      <p className="text-xs text-muted-foreground">INNOVA</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
