// /api/dashboard/calls/[PK_call]/projects/route.js
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

    // Obtener proyectos de la convocatoria
    const projects = await prisma.tbprojects.findMany({
      where: { FK_call: callId },
      include: {
        tbprojectmembers: {
          select: {
            role: true,
            isLeader: true,
            tbusers: {
              select: {
                PK_user: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        tbreviewdetails: {
          select: {
            score: true,
            FK_assignment: true, // opcional si quieres mostrar quien calificó
          },
        },
        tbprojecttypes: { select: { type: true } },
        tbprojectcategories: { select: { category: true} },
        tbprojectstatus: { select: { status: true} },
      },
    });

    // Mapear proyectos para devolver solo total de calificación
    const mappedProjects = projects.map(p => {
      const totalScore = p.tbreviewdetails.length
        ? p.tbreviewdetails.reduce((sum, r) => sum + r.score, 0)
        : 0;

      return {
        ...p,
        totalScore: totalScore || null,
        isQualified: p.tbreviewdetails.length > 0,
        tbreviewdetails: undefined, // eliminamos detalles individuales
      };
    });

    return NextResponse.json({ call, projects: mappedProjects });

  } catch (err) {
    console.error("Error al obtener proyectos:", err);
    return NextResponse.json({ error: "Error interno al obtener proyectos." }, { status: 500 });
  }
}
