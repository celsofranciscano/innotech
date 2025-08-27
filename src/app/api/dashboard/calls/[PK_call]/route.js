// /api/dashboard/calls/[PK_call]
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

/// --------------------------------------
/// GET: Listar convocatorias
/// --------------------------------------
export async function GET(request, { params }) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Docente",
    "Jurado",
    "Estudiante",
  ]);

  if (error) return NextResponse.json({ error }, { status });
  // con await params PK_call
  const { PK_call } = await params;

  try {
    const calls = await prisma.tbcalls.findUnique({
      where: {
        PK_call: Number(PK_call),
        FK_user: Number(token.user.id),
      },
    });

    return NextResponse.json(calls);
  } catch (err) {
    console.error("Error al obtener convocatorias:", err);
    return NextResponse.json(
      { error: "Error interno al obtener convocatorias." },
      { status: 500 }
    );
  }
}

