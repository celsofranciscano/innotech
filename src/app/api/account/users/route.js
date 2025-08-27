// src/app/api/account/users/route.ts
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
    // 2. Obtener solo los usuarios con privilegio "Estudiante"
    const students = await prisma.tbusers.findMany({
      where: {
        tbprivileges: {
          privilege: "Estudiante",
        },
      },
      select: {
        PK_user: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        tbprivileges: {
          select: { privilege: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(students);
  } catch (err) {
    console.error("Error al obtener estudiantes:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener estudiantes." },
      { status: 500 }
    );
  }
}
