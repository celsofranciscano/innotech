// /api/dashboard/calls/[PK_call]/projects/[PK_project]/route.js
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

export async function GET(request, { params }) {
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
    "Coordinador",
    "Invitado",
  ]);

  if (error) return NextResponse.json({ error }, { status });

  const userId = Number(token.user.id);
  const callId = Number(params.PK_call);
  const projectId = Number(params.PK_project);

  try {
    // Obtener convocatoria y jurados
    const call = await prisma.tbcalls.findUnique({
      where: { PK_call: callId },
      select: {
        PK_call: true,
        FK_user: true,
        title: true,
        description: true,
        tbjurors: { select: { FK_user: true } },
      },
    });
    if (!call) return NextResponse.json({ error: "Convocatoria no encontrada." }, { status: 404 });

    const isOwner = call.FK_user === userId;
    const isJuror = call.tbjurors.some(j => j.FK_user === userId);

    if (!isOwner && !isJuror) {
      return NextResponse.json({ error: "Acceso denegado: no eres coordinador ni jurado de esta convocatoria." }, { status: 403 });
    }

    // Obtener proyecto individual con toda su información
    const project = await prisma.tbprojects.findUnique({
      where: { PK_project: projectId },
      include: {
        tbprojectmembers: {
          include: {
            tbusers: true,
          },
        },
        tbreviewdetails: {
          include: {
            tbevaluationcriteria: true,
            tbjurors: true,
          },
        },
        tbprojecttypes: true,
        tbprojectcategories: true,
        tbprojectstatus: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
    }

    // Verificar que el proyecto pertenezca a la convocatoria
    if (project.FK_call !== callId) {
      return NextResponse.json({ error: "El proyecto no pertenece a esta convocatoria." }, { status: 400 });
    }

    return NextResponse.json({ call, project });

  } catch (err) {
    console.error("Error al obtener proyecto:", err);
    return NextResponse.json({ error: "Error interno al obtener proyecto." }, { status: 500 });
  }
}


export async function POST(request, { params }) {
  const callId = Number(params.PK_call);
  const projectId = Number(params.PK_project);

  // Verificar token y roles
  const {
    error: tokenError,
    status: tokenStatus,
    token,
  } = await tokenVerification(request, [
    "Superadministrador",
    "Coordinador",
    "Jurado",
  ]);
  if (tokenError)
    return NextResponse.json({ error: tokenError }, { status: tokenStatus });

  const userId = Number(token.user.id);

  try {
    const body = await request.json();
    const { ratings } = body; // [{ FK_criteria, score, comments? }]
    if (!ratings || !Array.isArray(ratings)) {
      return NextResponse.json(
        { error: "Se requiere un array de calificaciones." },
        { status: 400 }
      );
    }

    // Obtener proyecto con convocatoria, jurados y criterios
    const project = await prisma.tbprojects.findUnique({
      where: { PK_project: projectId },
      include: {
        tbcalls: {
          include: {
            tbjurors: true,
            tbevaluationcriteria: true,
          },
        },
      },
    });
    if (!project)
      return NextResponse.json(
        { error: "Proyecto no encontrado." },
        { status: 404 }
      );

    const call = project.tbcalls;

    // Verificar que el proyecto pertenezca a la convocatoria
    if (call.PK_call !== callId) {
      return NextResponse.json(
        { error: "El proyecto no pertenece a esta convocatoria." },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea jurado
    const juror = call.tbjurors.find((j) => j.FK_user === userId);
    if (!juror)
      return NextResponse.json(
        { error: "No eres jurado de esta convocatoria." },
        { status: 403 }
      );

    // Validar que se califiquen todos los criterios
    const requiredCriteria = call.tbevaluationcriteria;
    const requiredCriteriaIds = requiredCriteria.map((c) => c.PK_criteria);
    const submittedCriteriaIds = ratings.map((r) => r.FK_criteria);
    const missing = requiredCriteriaIds.filter(
      (id) => !submittedCriteriaIds.includes(id)
    );
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: "Debes calificar todos los criterios de la convocatoria.",
          missingCriteria: missing,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const reviewDetails = [];

    for (let r of ratings) {
      const criterion = requiredCriteria.find(
        (c) => c.PK_criteria === r.FK_criteria
      );
      if (!criterion) {
        return NextResponse.json(
          {
            error: `El criterio ${r.FK_criteria} no pertenece a esta convocatoria.`,
          },
          { status: 400 }
        );
      }
      if (
        typeof r.score !== "number" ||
        r.score < 0 ||
        r.score > criterion.maxScore
      ) {
        return NextResponse.json(
          {
            error: `Score inválido para el criterio ${criterion.criteria}. Debe estar entre 0 y ${criterion.maxScore}.`,
          },
          { status: 400 }
        );
      }

      // Validar si ya está calificado
      const existing = await prisma.tbreviewdetails.findFirst({
        where: {
          FK_project: projectId,
          FK_criteria: r.FK_criteria,
          FK_assignment: juror.PK_assignment,
        },
      });
      if (existing) {
        return NextResponse.json(
          {
            error: `Ya has calificado el criterio ${criterion.criteria} para este proyecto. No puedes volver a calificar.`,
          },
          { status: 400 }
        );
      }

      // Registrar calificación
      const actionHistory = {
        create: {
          userId,
          userRole: token.privilege,
          userName: `${token.user.firstName} ${token.user.lastName}`,
          timestamp: now.toISOString(),
        },
        updates: [],
      };

      const detail = await prisma.tbreviewdetails.create({
        data: {
          FK_project: projectId,
          FK_criteria: r.FK_criteria,
          FK_assignment: juror.PK_assignment,
          score: r.score,
          comments: r.comments,
          createdAt: now,
          updatedAt: now,
          actionHistory,
        },
      });
      reviewDetails.push(detail);
    }

    return NextResponse.json({
      message: "Calificación registrada correctamente.",
      reviewDetails,
    });
  } catch (err) {
    console.error("Error al calificar proyecto:", err);
    return NextResponse.json(
      { error: "Error interno al registrar calificación." },
      { status: 500 }
    );
  }
}
