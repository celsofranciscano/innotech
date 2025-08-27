// /api/settings/calls/status/route.js

import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

/// --------------------------------------
/// GET: Listar estados de proyectos
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
    const statuses = await prisma.tbprojectstatus.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        PK_status: true,
        status: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(statuses);
  } catch (err) {
    console.error("Error al obtener estados:", err);
    return NextResponse.json(
      { error: "Error interno al obtener estados de proyectos." },
      { status: 500 }
    );
  }
}

/// --------------------------------------
/// POST: Crear un nuevo estado de proyecto
/// --------------------------------------
export async function POST(request) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const { status: projectStatus, description } = await request.json();
    const now = new Date();

    // Validaciones
    if (!projectStatus?.trim()) {
      return NextResponse.json(
        { error: "El nombre del estado es obligatorio." },
        { status: 400 }
      );
    }

    // Revisar si ya existe
    const existing = await prisma.tbprojectstatus.findUnique({
      where: { status: projectStatus.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Este estado ya existe." },
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

    const newStatus = await prisma.tbprojectstatus.create({
      data: {
        status: projectStatus.trim(),
        description: description?.trim() || null,
        createdAt: now,
        updatedAt: now,
        actionHistory,
      },
    });

    return NextResponse.json({
      message: "Estado de proyecto creado con éxito.",
      success: true,
      projectStatus: newStatus,
    });
  } catch (err) {
    console.error("Error al crear estado:", err);
    return NextResponse.json(
      { error: "Error interno al crear estado de proyecto." },
      { status: 500 }
    );
  }
}
