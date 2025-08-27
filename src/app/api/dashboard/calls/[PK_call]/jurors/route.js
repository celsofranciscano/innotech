// /src/app/api/dashboard/calls/[PK_call]/jurors/route.js
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

export async function GET(request, { params }) {
  const { PK_call } = await params;

  const {error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Docente",
  ]);

  if (error) return NextResponse.json({ error }, { status });

  try {
    const jurors = await prisma.tbjurors.findMany({
      where: { FK_call: Number(PK_call) },
      include: { tbcalls: true }, // incluye info de la convocatoria
      orderBy: { assignedAt: "asc" },
    });

    return NextResponse.json(jurors);
  } catch (err) {
    console.error("Error al obtener jurados:", err);
    return NextResponse.json(
      { error: "Error interno al obtener jurados." },
      { status: 500 }
    );
  }
}

/// --------------------------------------
/// POST: Asignar jurado a una convocatoria
/// --------------------------------------
export async function POST(request, { params }) {
  const { PK_call } = await params;

  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const { FK_user, notes } = await request.json();
    const now = new Date();

    if (!FK_user) {
      return NextResponse.json(
        { error: "Debe proporcionar el ID del jurado." },
        { status: 400 }
      );
    }

    const actionHistory = {
      create: {
        userId: Number(token.user.id),
        userRole: token.privilege,
        userName: `${token.user.firstName} ${token.user.lastName}`,
        timestamp: now.toISOString(),
      },
      updates: [],
    };

    const newJuror = await prisma.tbjurors.create({
      data: {
        FK_call: Number(PK_call),
        FK_user: Number(FK_user),
        notes: notes?.trim() || null,
        assignedAt: now,
        createdAt: now,
        updatedAt: now,
        actionHistory,
      },
    });

    return NextResponse.json({
      message: "Jurado asignado con éxito.",
      success: true,
      juror: newJuror,
    });
  } catch (err) {
    console.error("Error al asignar jurado:", err);
    return NextResponse.json(
      { error: "Error interno al asignar jurado." },
      { status: 500 }
    );
  }
}
