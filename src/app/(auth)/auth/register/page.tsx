import { RegisterForm } from "@/components/upds-innova/auth/register-form";
import Link from "next/link";
export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-1">
            <img className="size-8" src="/logo-upds-innova.png" alt="" />

            <span className=" font-bold">InnoTech</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
            {/* si no tiene cuenta registrarse enlace  */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <Link href={"/auth/login"}>
                ¿Tienes una cuenta?{" "}
                <span className="font-semibold text-blue-500">
                  Iniciar aqui
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://i.pinimg.com/1200x/35/d4/97/35d49776f04440cb9886ae0bd015e402.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
