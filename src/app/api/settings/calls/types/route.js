// /api/settings/calls/types/route.js

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
        createdAt: true,
        updatedAt: true,
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

/// --------------------------------------
/// POST: Crear tipo de proyecto
/// --------------------------------------
export async function POST(request) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const { type, description } = await request.json();
    const now = new Date();

    // Validaciones
    if (!type?.trim()) {
      return NextResponse.json(
        { error: "El campo 'type' es obligatorio." },
        { status: 400 }
      );
    }

    // Evitar duplicados
    const existing = await prisma.tbprojecttypes.findUnique({
      where: { type: type.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Este tipo de proyecto ya existe." },
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

    const newType = await prisma.tbprojecttypes.create({
      data: {
        type: type.trim(),
        description: description?.trim() || null,
        createdAt: now,
        updatedAt: now,
        actionHistory,
      },
    });

    return NextResponse.json({
      message: "Tipo de proyecto creado con éxito.",
      success: true,
      type: newType,
    });
  } catch (err) {
    console.error("Error al crear tipo de proyecto:", err);
    return NextResponse.json(
      { error: "Error interno al crear tipo de proyecto." },
      { status: 500 }
    );
  }
}
