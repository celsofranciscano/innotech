// /api/dashboard/calls
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";
import { parseISO,isAfter } from "date-fns";

/// --------------------------------------
/// GET: Listar convocatorias
/// --------------------------------------
export async function GET(request) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
    "Docente",
    "Jurado",
    "Estudiante",
  ]);

  if (error) return NextResponse.json({ error }, { status });

  try {
    const calls = await prisma.tbcalls.findMany({
      orderBy: { submissionOpen: "desc" },
      where: {
        FK_user: Number(token.user.id),
      },
    });

    return NextResponse.json(calls);
  } catch (err) {
    console.error("Error al obtener convocatorias:", err);
    return NextResponse.json(
      { error: "Error interno al obtener convocatorias." },
      { status: 500 }
    );
  }
}

/// --------------------------------------
/// POST: Crear convocatoria
/// --------------------------------------
export async function POST(request) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Administrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const {
      title,
      description,
      note,
      pdfGuidelines,
      submissionOpen,
      submissionClose,
      isActive,
      isIndividual,
      allowedProjectTypes,
      allowedCategories,
      minTeamMembers,
      maxTeamMembers,
      minExperienceLevel,
      minTechRequirements,
      prizes,
      materia,
      semestre,
      resultsAnnouncement,
    } = await request.json();

    const now = new Date();

    // Validaciones
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "El título de la convocatoria es obligatorio." },
        { status: 400 }
      );
    }

    if (!submissionOpen || !submissionClose) {
      return NextResponse.json(
        { error: "Fechas de apertura y cierre son obligatorias." },
        { status: 400 }
      );
    }

    const openDate = parseISO(submissionOpen);
    const closeDate = parseISO(submissionClose);

    if (isAfter(openDate, closeDate)) {
      return NextResponse.json(
        { error: "La fecha de apertura no puede ser posterior al cierre." },
        { status: 400 }
      );
    }

    if (
      minTeamMembers != null &&
      maxTeamMembers != null &&
      minTeamMembers > maxTeamMembers
    ) {
      return NextResponse.json(
        { error: "minTeamMembers no puede ser mayor que maxTeamMembers." },
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

    const newCall = await prisma.tbcalls.create({
      data: {
        FK_user: Number(token.user.id),
        title: title.trim(),
        description: description?.trim() || null,
        note: note?.trim() || null,
        pdfGuidelines: pdfGuidelines?.trim() || null,
        submissionOpen: openDate,
        submissionClose: closeDate,
        isActive: isActive ?? true,
        isIndividual: isIndividual ?? true,
        allowedProjectTypes: allowedProjectTypes || null,
        allowedCategories: allowedCategories || null,
        minTeamMembers: minTeamMembers ?? null,
        maxTeamMembers: maxTeamMembers ?? null,
        minExperienceLevel: minExperienceLevel?.trim() || null,
        minTechRequirements: minTechRequirements || null,
        prizes: prizes || null,
        materia: materia?.trim() || null,
        semestre: semestre?.trim() || null,
        resultsAnnouncement: resultsAnnouncement
          ? parseISO(resultsAnnouncement)
          : null,
        createdAt: now,
        updatedAt: now,
        actionHistory,
      },
    });

    return NextResponse.json({
      message: "Convocatoria creada con éxito.",
      success: true,
      call: newCall,
    });
  } catch (err) {
    console.error("Error al crear convocatoria:", err);
    return NextResponse.json(
      { error: "Error interno al crear convocatoria." },
      { status: 500 }
    );
  }
}
