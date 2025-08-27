// /api/account/types
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

/// --------------------------------------
/// GET: Listar tipos de proyecto
/// --------------------------------------
export async function GET(request) {
  const { error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Docente",
    "Jurado",
    "Estudiante",
  ]);

  if (error) return NextResponse.json({ error }, { status });

  try {
    const types = await prisma.tbprojecttypes.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        PK_type: true,
        type: true,
        description: true,
      },
    });

    return NextResponse.json(types);
  } catch (err) {
    console.error("Error al obtener tipos de proyecto:", err);
    return NextResponse.json(
      { error: "Error interno al obtener tipos de proyecto." },
      { status: 500 }
    );
  }
}