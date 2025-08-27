// /api/settings/calls/types/[PK_type]/route.js

import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

// GET: Obtener tipo de proyecto por ID
export async function GET(request, { params }) {
  const { error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Invitado",
  ]);

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  const { PK_type } = params;

  if (!PK_type || isNaN(Number(PK_type))) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const type = await prisma.tbprojecttypes.findUnique({
      where: { PK_type: Number(PK_type) },
      select: {
        PK_type: true,
        type: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        actionHistory: true,
      },
    });

    if (!type) {
      return NextResponse.json(
        { error: "Tipo de proyecto no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ type });
  } catch (err) {
    console.error("Error al obtener tipo de proyecto:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar tipo de proyecto
export async function PATCH(request, { params }) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
  ]);

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  const { PK_type } = params;

  if (!PK_type || isNaN(Number(PK_type))) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const data = await request.json();

    const existing = await prisma.tbprojecttypes.findUnique({
      where: { PK_type: Number(PK_type) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tipo de proyecto no encontrado." },
        { status: 404 }
      );
    }

    const fieldsToUpdate = {};
    const changes = {};

    // type puede actualizarse libremente
    if (data.hasOwnProperty("type") && data.type !== existing.type) {
      changes["type"] = {
        old: existing.type,
        new: data.type,
      };
      fieldsToUpdate["type"] = data.type;
    }

    // description también puede actualizarse
    if (
      data.hasOwnProperty("description") &&
      data.description !== existing.description
    ) {
      changes["description"] = {
        old: existing.description,
        new: data.description,
      };
      fieldsToUpdate["description"] = data.description;
    }

    if (Object.keys(changes).length === 0) {
      return NextResponse.json(
        { message: "No se realizaron cambios." },
        { status: 200 }
      );
    }

    let history = existing.actionHistory || { create: {}, updates: [] };
    if (typeof history === "string") {
      try {
        history = JSON.parse(history);
      } catch {
        history = { create: {}, updates: [] };
      }
    }

    const updateRecord = {
      userId: Number(token.user.id),
      userRole: token.privilege,
      userName: `${token.user.firstName} ${token.user.lastName}`,
      timestamp: new Date().toISOString(),
      changes,
    };

    history.updates = [...(history.updates || []), updateRecord];

    const type = await prisma.tbprojecttypes.update({
      where: { PK_type: Number(PK_type) },
      data: {
        ...fieldsToUpdate,
        updatedAt: new Date(),
        actionHistory: history,
      },
    });

    return NextResponse.json({
      message: "Tipo de proyecto actualizado con éxito.",
      success: true,
      type,
    });
  } catch (err) {
    console.error("Error al actualizar tipo de proyecto:", err);
    return NextResponse.json(
      { error: "Error interno al actualizar." },
      { status: 500 }
    );
  }
}
