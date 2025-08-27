// /api/account/categories
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

/// --------------------------------------
/// GET: Listar categorías de proyecto
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
      },
    });

    return NextResponse.json(categories);
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    return NextResponse.json(
      { error: "Error interno al obtener categorías." },
      { status: 500 }
    );
  }
}