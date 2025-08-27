// /api/settings/calls/categories/route.js
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

/// --------------------------------------
/// GET: Listar categorías de proyectos
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
    const categories = await prisma.tbprojectcategories.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        PK_category: true,
        category: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(categories);
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    return NextResponse.json(
      { error: "Error interno al obtener categorías de proyectos." },
      { status: 500 }
    );
  }
}

/// --------------------------------------
/// POST: Crear una nueva categoría de proyecto
/// --------------------------------------
export async function POST(request) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const { category, description } = await request.json();
    const now = new Date();

    // Validaciones
    if (!category?.trim()) {
      return NextResponse.json(
        { error: "El nombre de la categoría es obligatorio." },
        { status: 400 }
      );
    }

    // Revisar si ya existe
    const existing = await prisma.tbprojectcategories.findUnique({
      where: { category: category.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Esta categoría ya existe." },
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

    const newCategory = await prisma.tbprojectcategories.create({
      data: {
        category: category.trim(),
        description: description?.trim() || null,
        createdAt: now,
        updatedAt: now,
        actionHistory,
      },
    });

    return NextResponse.json({
      message: "Categoría de proyecto creada con éxito.",
      success: true,
      category: newCategory,
    });
  } catch (err) {
    console.error("Error al crear categoría:", err);
    return NextResponse.json(
      { error: "Error interno al crear categoría de proyecto." },
      { status: 500 }
    );
  }
}
