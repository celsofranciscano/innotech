"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      // Registro en la API
      const res = await axios.post("/api/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      if (res.data.error) {
        toast.error(res.data.error);
        return;
      }

      toast.success("Registro exitoso. Iniciando sesión...");

      // Login automático
      const loginResponse = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResponse?.error) {
        toast.error("Error al iniciar sesión automáticamente");
      } else if (loginResponse?.ok) {
        await axios.get("/api/settings/auth/devices/login");
        router.push("/account");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error || "Error en el servidor";
        toast.error(apiError);
      } else {
        toast.error("Error desconocido en registro");
      }
    }
  });

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Completa tus datos para registrarte
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            {...register("firstName", { required: "El nombre es obligatorio" })}
          />
          {errors.firstName && (
            <span className="text-xs text-red-500">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            {...register("lastName", {
              required: "El apellido es obligatorio",
            })}
          />
          {errors.lastName && (
            <span className="text-xs text-red-500">
              {errors.lastName.message}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            {...register("email", { required: "El correo es obligatorio" })}
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 8,
                message: "Mínimo 8 caracteres",
              },
            })}
          />
          {errors.password && (
            <span className="text-xs text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          Registrarse
        </Button>
      </div>
    </form>
  );
}
