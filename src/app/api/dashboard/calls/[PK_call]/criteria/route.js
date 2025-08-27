// /src/app/api/dashboard/calls[PK_call]/criteria/route.js
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";


/// --------------------------------------
/// GET: Listar criterios por convocatoria
/// --------------------------------------
export async function GET(request, { params }) {
  const { PK_call } = await params;

  const { error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Docente",
    "Jurado",
  ]);

  if (error) return NextResponse.json({ error }, { status });

  try {
    const criteria = await prisma.tbevaluationcriteria.findMany({
      where: { FK_call: Number(PK_call) },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(criteria);
  } catch (err) {
    console.error("Error al obtener criterios:", err);
    return NextResponse.json(
      { error: "Error interno al obtener criterios." },
      { status: 500 }
    );
  }
}

/// --------------------------------------
/// POST: Crear criterio para una convocatoria
/// --------------------------------------
export async function POST(request, { params }) {
  const { PK_call } = await params;

  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const { criteria, description, maxScore } = await request.json();
    const now = new Date();

    if (!criteria?.trim()) {
      return NextResponse.json(
        { error: "El nombre del criterio es obligatorio." },
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

    const newCriteria = await prisma.tbevaluationcriteria.create({
      data: {
        FK_call: Number(PK_call),
        criteria: criteria.trim(),
        description: description?.trim() || null,
        maxScore: maxScore ?? 10,
        createdAt: now,
        updatedAt: now,
        actionHistory,
      },
    });

    return NextResponse.json({
      message: "Criterio creado con éxito.",
      success: true,
      criteria: newCriteria,
    });
  } catch (err) {
    console.error("Error al crear criterio:", err);
    return NextResponse.json(
      { error: "Error interno al crear criterio." },
      { status: 500 }
    );
  }
}
