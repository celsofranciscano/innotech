// /src/app/api/account/calls/[PK_call]/project/route.js
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

export async function POST(request, { params }) {
  const { PK_call } = await params;

  const { token, error, status } = await tokenVerification(request, [
    "Estudiante",
    "Superadministrador",
    "Administrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const {
      title,
      shortSummary,
      problem,
      solution,
      coverImage,
      repoUrl,
      demoUrl,
      videoUrl,
      technologies,
      tags,
      members, // array opcional de miembros
      FK_type,
      FK_category,
      isDraft, // estado del proyecto
    } = await request.json();

    if (
      !title?.trim() ||
      !shortSummary?.trim() ||
      !problem?.trim() ||
      !solution?.trim()
    ) {
      return NextResponse.json(
        { error: "Título, resumen, problema y solución son obligatorios." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Obtener la convocatoria para determinar si es individual
    const call = await prisma.tbcalls.findUnique({
      where: { PK_call: Number(PK_call) },
    });

    if (!call) {
      return NextResponse.json(
        { error: "Convocatoria no encontrada." },
        { status: 404 }
      );
    }

    // Obtener FK_status según isDraft
    const statusName = isDraft ? "Borrador" : "Pendiente";
    const projectStatus = await prisma.tbprojectstatus.findUnique({
      where: { status: statusName },
    });

    if (!projectStatus) {
      return NextResponse.json(
        {
          error: `No se encontró el estado "${statusName}" en tbprojectstatus.`,
        },
        { status: 500 }
      );
    }

    // Crear proyecto
    const newProject = await prisma.tbprojects.create({
      data: {
        FK_call: Number(PK_call),
        FK_type: FK_type ?? null,
        FK_category: FK_category ?? null,
        FK_status: projectStatus.PK_status,
        title: title.trim(),
        shortSummary: shortSummary.trim(),
        problem: problem.trim(),
        solution: solution.trim(),
        coverImage: coverImage?.trim() || null,
        repoUrl: repoUrl?.trim() || null,
        demoUrl: demoUrl?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        technologies: technologies || null,
        tags: tags || null,
        createdAt: now,
        updatedAt: now,
        actionHistory: {
          create: {
            userId: Number(token.user.id),
            userRole: token.privilege,
            userName: `${token.user.firstName} ${token.user.lastName}`,
            timestamp: now.toISOString(),
          },
          updates: [],
        },
      },
    });

    // Insertar miembros
    const membersToInsert = [];
    membersToInsert.push({
      FK_user: Number(token.user.id),
      role: "Líder",
      isLeader: true,
    });

    if (!call.isIndividual && Array.isArray(members)) {
      for (const m of members) {
        membersToInsert.push({
          FK_user: m.FK_user,
          role: m.role ?? null,
          isLeader: m.isLeader ?? false,
        });
      }
    }

    for (const member of membersToInsert) {
      await prisma.tbprojectmembers.create({
        data: {
          FK_project: newProject.PK_project,
          ...member,
          actionHistory: {
            create: {
              userId: Number(token.user.id),
              userRole: token.privilege,
              userName: `${token.user.firstName} ${token.user.lastName}`,
              timestamp: now.toISOString(),
            },
            updates: [],
          },
        },
      });
    }

    return NextResponse.json({
      message: "Proyecto creado con éxito.",
      success: true,
      project: newProject,
    });
  } catch (err) {
    console.error("Error al crear proyecto:", err);
    return NextResponse.json(
      { error: "Error interno al crear proyecto." },
      { status: 500 }
    );
  }
}
