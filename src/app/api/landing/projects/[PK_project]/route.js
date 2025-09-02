// /api/landing/projects/[PK_project]/route.js
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";

/// --------------------------------------
/// GET: Obtener un proyecto público por ID con type, category y miembros
/// --------------------------------------
export async function GET(_request, { params }) {
  try {
    const { PK_project } = params;

    const project = await prisma.tbprojects.findUnique({
      where: {
        PK_project: Number(PK_project),
      },
      include: {
        tbprojecttypes: { select: { type: true } },
        tbprojectcategories: { select: { category: true } },
        tbprojectmembers: {
          include: {
            tbusers: {
              select: {
                PK_user: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                profession: true,
                specialization: true,
                linkedinUrl: true,
                githubUrl: true,
                websiteUrl: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Simplificar estructura
    const formatted = {
      PK_project: project.PK_project,
      title: project.title,
      shortSummary: project.shortSummary,
      problem: project.problem,
      solution: project.solution,
      coverImage: project.coverImage,
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl,
      videoUrl: project.videoUrl,
      technologies: project.technologies,
      tags: project.tags,
      createdAt: project.createdAt,
      isPublished: project.isPublished,
      type: project.tbprojecttypes?.type || null,
      category: project.tbprojectcategories?.category || null,
      members: project.tbprojectmembers.map((m) => ({
        PK_member: m.PK_member,
        role: m.role,
        isLeader: m.isLeader,
        user: {
          PK_user: m.tbusers.PK_user,
          firstName: m.tbusers.firstName,
          lastName: m.tbusers.lastName,
          email: m.tbusers.email,
          profileImage: m.tbusers.profileImage,
          profession: m.tbusers.profession,
          specialization: m.tbusers.specialization,
          linkedinUrl: m.tbusers.linkedinUrl,
          githubUrl: m.tbusers.githubUrl,
          websiteUrl: m.tbusers.websiteUrl,
        },
      })),
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error al obtener proyecto público:", err);
    return NextResponse.json(
      { error: "Error interno al obtener proyecto público. " + err.message },
      { status: 500 }
    );
  }
}
