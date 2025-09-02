// /api/landing/projects/route.js
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";

/// --------------------------------------
/// GET: Listar proyectos públicos con type y category en plano
/// --------------------------------------
export async function GET() {
  try {
    const projects = await prisma.tbprojects.findMany({
      include: {
        tbprojecttypes: { select: { type: true } },
        tbprojectcategories: { select: { category: true } },
      },
    });

    // Simplificar estructura
    const formatted = projects.map((p) => ({
      PK_project: p.PK_project,
      title: p.title,
      shortSummary: p.shortSummary,
      problem: p.problem,
      solution: p.solution,
      coverImage: p.coverImage,
      repoUrl: p.repoUrl,
      demoUrl: p.demoUrl,
      videoUrl: p.videoUrl,
      technologies: p.technologies,
      tags: p.tags,
      createdAt: p.createdAt,

      isPublished: p.isPublished,
      type: p.tbprojecttypes?.type || null,
      category: p.tbprojectcategories?.category || null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error al obtener proyectos públicos:", err);
    return NextResponse.json(
      { error: "Error interno al obtener proyectos públicos. " + err.message },
      { status: 500 }
    );
  }
}
