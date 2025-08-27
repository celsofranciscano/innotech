// /src/app/api/dashboard/calls/[PK_call]/jurors/route.ts
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

/// --------------------------------------
/// GET: Obtener todos los jurados de una convocatoria
/// Accesible para: Superadministrador, Administrador, Coordinador
/// --------------------------------------
export async function GET(request, { params }) {
  const { PK_call } = await params;

  const { error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Estudiante",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const jurors = await prisma.tbjurors.findMany({
      where: { FK_call: Number(PK_call) },
      orderBy: { createdAt: "asc" },
      select: {
        PK_assignment: true,
        FK_user: true,
        assignedAt: true,
        notes: true,
        tbusers: {
          select: {
            PK_user: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(jurors);
  } catch (err) {
    console.error("Error al obtener jurados:", err);
    return NextResponse.json(
      { error: "Error interno al obtener jurados de la convocatoria." },
      { status: 500 }
    );
  }
}
