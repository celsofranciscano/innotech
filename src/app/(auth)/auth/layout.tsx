import type React from "react";

import { SessionProvider } from "next-auth/react";
import "../../globals.css";

import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "El Rosario",
  description: "OTB EL ROSARIO DIGITAL",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SessionProvider>
        <html lang="es" suppressHydrationWarning>
          <head />
          <body className="">
            {children}
            <Toaster />
          </body>
        </html>
      </SessionProvider>
    </>
  );
}
