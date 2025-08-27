// /api/account/calls
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

/// --------------------------------------
/// GET: Listar convocatorias
/// --------------------------------------
export async function GET(request) {
  const {  error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Docente",
    "Jurado",
    "Estudiante",
  ]);

  if (error) return NextResponse.json({ error }, { status });

  try {
    const calls = await prisma.tbcalls.findMany({
      orderBy: { submissionOpen: "desc" },
      where: {
        isActive: true,
      },
    });

    return NextResponse.json(calls);
  } catch (err) {
    console.error("Error al obtener convocatorias:", err);
    return NextResponse.json(
      { error: "Error interno al obtener convocatorias." +err.message },
      { status: 500 }
    );
  }
}
