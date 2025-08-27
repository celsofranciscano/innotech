"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Settings, User, LogOut } from "lucide-react";

const getPrivilegeColor = (privilege: string) => {
  switch (privilege) {
    case "Superadministrador":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Administrador":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Invitado":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function ProfileCard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkDeviceSession = async () => {
      try {
        const response = await axios.get("/api/settings/auth/devices/update");
        if (response.data?.forceLogout === true) {
          console.warn("Dispositivo inválido. Cerrando sesión...");
          await signOut({ callbackUrl: "/" });
        }
      } catch (error: any) {
        console.error("Error al verificar dispositivo:", error);
        await signOut({ callbackUrl: "/" });
      }
    };

    checkDeviceSession();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await axios.get("/api/settings/auth/devices/logout");
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session || !session.user) return null;

  const user = session.user as {
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
    privilege: string;
  };

  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(
      0
    )}`.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || ""} alt="Avatar" />
            <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center space-x-3 p-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || ""} alt="Avatar" />
              <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-base font-medium leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className={`text-xs ${getPrivilegeColor(user.privilege)}`}>
                <span className="flex items-center gap-1">
                  {user.privilege}
                </span>
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        {user.privilege === "Superadministrador" && (
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="flex items-center cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/profile"
            className="flex items-center cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoading ? "Cerrando sesión..." : "Cerrar sesión"}</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
