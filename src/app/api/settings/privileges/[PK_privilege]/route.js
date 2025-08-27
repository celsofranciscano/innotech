// /api/settings/privileges/[PK_privilege]/route.js

import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

// Valores permitidos
const ALLOWED_PRIVILEGES = [
  "Superadministrador",
  "Coordinador",
  "Estudiante",
  "Supervisor",
  "Invitado",
];

// GET: Obtener privilegio por ID
export async function GET(request, { params }) {
  const { error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Invitado",
  ]);

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  const { PK_privilege } = params;

  if (!PK_privilege || isNaN(Number(PK_privilege))) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const privilege = await prisma.tbprivileges.findUnique({
      where: { PK_privilege: Number(PK_privilege) },
      select: {
        PK_privilege: true,
        privilege: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        actionHistory: true,
      },
    });

    if (!privilege) {
      return NextResponse.json(
        { error: "Privilegio no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ privilege });
  } catch (err) {
    console.error("Error al obtener privilegio:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar privilegio
export async function PATCH(request, { params }) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
  ]);

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  const { PK_privilege } = params;

  if (!PK_privilege || isNaN(Number(PK_privilege))) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const data = await request.json();

    const existing = await prisma.tbprivileges.findUnique({
      where: { PK_privilege: Number(PK_privilege) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Privilegio no encontrado." },
        { status: 404 }
      );
    }

    const fieldsToUpdate = {};
    const changes = {};

    // Validar privilegio permitido
    if (
      data.hasOwnProperty("privilege") &&
      data.privilege !== existing.privilege
    ) {
      if (!ALLOWED_PRIVILEGES.includes(data.privilege)) {
        return NextResponse.json(
          {
            error: `Privilegio inválido. Solo se permiten: ${ALLOWED_PRIVILEGES.join(
              ", "
            )}.`,
          },
          { status: 400 }
        );
      }

      changes["privilege"] = {
        old: existing.privilege,
        new: data.privilege,
      };
      fieldsToUpdate["privilege"] = data.privilege;
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

    const privilege = await prisma.tbprivileges.update({
      where: { PK_privilege: Number(PK_privilege) },
      data: {
        ...fieldsToUpdate,
        updatedAt: new Date(),
        actionHistory: history,
      },
    });

    return NextResponse.json({
      message: "Privilegio actualizado con éxito.",
      success: true,
      privilege,
    });
  } catch (err) {
    console.error("Error al actualizar privilegio:", err);
    return NextResponse.json(
      { error: "Error interno al actualizar." },
      { status: 500 }
    );
  }
}
