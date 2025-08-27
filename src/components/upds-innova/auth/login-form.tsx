"use client";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      const response = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!response) {
        throw new Error("No se recibió respuesta del servidor.");
      }

      if (response.ok) {
        toast.success("Inicio de sesión exitoso");

        try {
          await axios.get("/api/settings/auth/devices/login");
        } catch (deviceError) {
          const errMsg =
            deviceError instanceof Error
              ? deviceError.message
              : "No se pudo registrar el dispositivo.";
          console.error("Error en registro de dispositivo:", errMsg);
          toast.warning(
            "Iniciaste sesión, pero hubo un problema registrando tu dispositivo."
          );
        }

        router.push("/account");
      }
    } catch (error) {
      // Mejor manejo del error sin usar 'any'
      const err =
        error instanceof Error
          ? error.message
          : "Error desconocido al iniciar sesión.";
      console.error("Error en login:", err);
      toast.error(err);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Inicia sesión en tu cuenta</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Ingresa tus datos a continuación
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="celso@gmail.com"
            {...register("email", { required: "El correo es obligatorio" })}
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
            {/* <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a> */}
          </div>
          <Input
            id="password"
            type="password"
            {...register("password", {
              required: "La contraseña es obligatoria",
            })}
          />
          {errors.password && (
            <span className="text-xs text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          Iniciar sesión
        </Button>
      </div>
    </form>
  );
}
