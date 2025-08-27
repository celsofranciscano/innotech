// src/app/api/dashboard/users/route.ts
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

export async function GET(request) {
  // 1. Verificar token y permisos
  const { status, error } = await tokenVerification(request, [
    "Superadministrador",
  ]);
  if (error) {
    return NextResponse.json({ error }, { status });
  }

  try {
    // 2. Obtener todos los usuarios con sus privilegios y dispositivos
    const users = await prisma.tbusers.findMany({
      select: {
        PK_user: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(users);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener usuarios."},
      { status: 500 }
    );
  }
}
