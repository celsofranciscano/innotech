// /api/settings/calls/categories/[PK_category]/route.js

import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

// --------------------------------------
// GET: Obtener categoría de proyecto por ID
// --------------------------------------
export async function GET(request, { params }) {
  const { error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Invitado",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  const { PK_category } = params;
  if (!PK_category || isNaN(Number(PK_category))) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const projectCategory = await prisma.tbprojectcategories.findUnique({
      where: { PK_category: Number(PK_category) },
      select: {
        PK_category: true,
        category: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        actionHistory: true,
      },
    });

    if (!projectCategory) {
      return NextResponse.json(
        { error: "Categoría de proyecto no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ projectCategory });
  } catch (err) {
    console.error("Error al obtener categoría de proyecto:", err);
    return NextResponse.json(
      { error: "Error interno al obtener categoría de proyecto." },
      { status: 500 }
    );
  }
}

// --------------------------------------
// PATCH: Actualizar categoría de proyecto
// --------------------------------------
export async function PATCH(request, { params }) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  const { PK_category } = params;
  if (!PK_category || isNaN(Number(PK_category))) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const data = await request.json();
    const existing = await prisma.tbprojectcategories.findUnique({
      where: { PK_category: Number(PK_category) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Categoría de proyecto no encontrada." },
        { status: 404 }
      );
    }

    const fieldsToUpdate = {};
    const changes = {};

    // category es libre
    if (data.hasOwnProperty("category") && data.category !== existing.category) {
      changes.category = { old: existing.category, new: data.category };
      fieldsToUpdate.category = data.category;
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

    const updatedCategory = await prisma.tbprojectcategories.update({
      where: { PK_category: Number(PK_category) },
      data: { ...fieldsToUpdate, updatedAt: new Date(), actionHistory: history },
    });

    return NextResponse.json({
      message: "Categoría de proyecto actualizada con éxito.",
      success: true,
      projectCategory: updatedCategory,
    });
  } catch (err) {
    console.error("Error al actualizar categoría de proyecto:", err);
    return NextResponse.json(
      { error: "Error interno al actualizar categoría de proyecto." },
      { status: 500 }
    );
  }
}
