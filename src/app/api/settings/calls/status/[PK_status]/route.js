// /api/settings/calls/status/[PK_status]/route.js

import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

const ALLOWED_STATUS = [
  "Borrador",
  "Pendiente",
  "En Revisión",
  "Aprobado",
  "Rechazado",
];

// --------------------------------------
// GET: Obtener estado de proyecto por ID
// --------------------------------------
export async function GET(request, { params }) {
  const { error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Invitado",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  const { PK_status } = params;
  if (!PK_status || isNaN(Number(PK_status))) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const projectStatus = await prisma.tbprojectstatus.findUnique({
      where: { PK_status: Number(PK_status) },
      select: {
        PK_status: true,
        status: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        actionHistory: true,
      },
    });

    if (!projectStatus) {
      return NextResponse.json(
        { error: "Estado de proyecto no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ projectStatus });
  } catch (err) {
    console.error("Error al obtener estado de proyecto:", err);
    return NextResponse.json(
      { error: "Error interno al obtener estado de proyecto." },
      { status: 500 }
    );
  }
}

// --------------------------------------
// PATCH: Actualizar estado de proyecto
// --------------------------------------
export async function PATCH(request, { params }) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  const { PK_status } = params;
  if (!PK_status || isNaN(Number(PK_status))) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const data = await request.json();
    const existing = await prisma.tbprojectstatus.findUnique({
      where: { PK_status: Number(PK_status) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Estado de proyecto no encontrado." },
        { status: 404 }
      );
    }

    const fieldsToUpdate = {};
    const changes = {};

    // status debe estar dentro de los permitidos
    if (data.hasOwnProperty("status") && data.status !== existing.status) {
      if (!ALLOWED_STATUS.includes(data.status)) {
        return NextResponse.json(
          { error: `Estado inválido. Solo se permiten: ${ALLOWED_STATUS.join(", ")}.` },
          { status: 400 }
        );
      }

      // Evitar duplicados
      const duplicate = await prisma.tbprojectstatus.findUnique({
        where: { status: data.status },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Este estado ya existe." },
          { status: 400 }
        );
      }

      changes.status = { old: existing.status, new: data.status };
      fieldsToUpdate.status = data.status;
    }

    // description también puede actualizarse
    if (data.hasOwnProperty("description") && data.description !== existing.description) {
      changes.description = { old: existing.description, new: data.description };
      fieldsToUpdate.description = data.description;
    }

    if (Object.keys(changes).length === 0) {
      return NextResponse.json({ message: "No se realizaron cambios." }, { status: 200 });
    }

    // Manejo de actionHistory
    let history = existing.actionHistory || { create: {}, updates: [] };
    if (typeof history === "string") {
      try { history = JSON.parse(history); } 
      catch { history = { create: {}, updates: [] }; }
    }

    const updateRecord = {
      userId: Number(token.user.id),
      userRole: token.privilege,
      userName: `${token.user.firstName} ${token.user.lastName}`,
      timestamp: new Date().toISOString(),
      changes,
    };
    history.updates = [...(history.updates || []), updateRecord];

    const updatedStatus = await prisma.tbprojectstatus.update({
      where: { PK_status: Number(PK_status) },
      data: { ...fieldsToUpdate, updatedAt: new Date(), actionHistory: history },
    });

    return NextResponse.json({
      message: "Estado de proyecto actualizado con éxito.",
      success: true,
      projectStatus: updatedStatus,
    });
  } catch (err) {
    console.error("Error al actualizar estado de proyecto:", err);
    return NextResponse.json(
      { error: "Error interno al actualizar estado de proyecto." },
      { status: 500 }
    );
  }
}
