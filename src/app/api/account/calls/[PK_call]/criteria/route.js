// /src/app/api/dashboard/calls/[PK_call]/criteria/route.ts
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

/// --------------------------------------
/// GET: Obtener todos los criterios de evaluación de una convocatoria
/// Accesible para: Superadministrador, Administrador, Coordinador, Jurado
/// --------------------------------------
export async function GET(request, { params }) {
  const { PK_call } = await params;

  const { error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Estudiante",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const criteria = await prisma.tbevaluationcriteria.findMany({
      where: { FK_call: Number(PK_call) },
      orderBy: { createdAt: "asc" },
      select: {
        PK_criteria: true,
        criteria: true,
        description: true,
        maxScore: true,
      },
    });

    return NextResponse.json(criteria);
  } catch (err) {
    console.error("Error al obtener criterios:", err);
    return NextResponse.json(
      { error: "Error interno al obtener criterios de evaluación." },
      { status: 500 }
    );
  }
}
