// /api/settings/privileges/route.js
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

const ALLOWED_PRIVILEGES = [
  "Superadministrador",
  "Coordinador",
  "Estudiante",
  "Supervisor",
  "Invitado",
];

// GET ALL (Obtener todos los privilegios)
export async function GET(request) {
  const { status, error } = await tokenVerification(request, ["Superadministrador"]);
  if (error) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const privileges = await prisma.tbprivileges.findMany();
    return NextResponse.json(privileges);
  } catch (err) {
    console.error("Error al obtener privilegios:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST (Crear privilegio)
export async function POST(request) {
  const { token, status, error } = await tokenVerification(request, ["Superadministrador"]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const { privilege, description } = await request.json();

    if (!privilege) {
      return NextResponse.json(
        { error: "El campo 'privilege' es obligatorio." },
        { status: 400 }
      );
    }

    if (!ALLOWED_PRIVILEGES.includes(privilege)) {
      return NextResponse.json(
        {
          error: `El privilegio debe ser uno de los siguientes: ${ALLOWED_PRIVILEGES.join(
            ", "
          )}.`,
        },
        { status: 400 }
      );
    }

    const existingPrivilege = await prisma.tbprivileges.findUnique({ where: { privilege } });
    if (existingPrivilege) {
      return NextResponse.json(
        { error: "Ya existe un privilegio con este nombre." },
        { status: 400 }
      );
    }

    const actionHistory = {
      create: {
        userId: Number(token.user.id),
        userRole: token.privilege,
        userName: `${token.user.firstName} ${token.user.lastName}`,
        timestamp: new Date().toISOString(),
      },
      updates: [],
    };

    await prisma.tbprivileges.create({
      data: {
        privilege,
        description: description || "", // usa el valor recibido o vacío
        actionHistory,
      },
    });

    return NextResponse.json({ message: "Privilegio creado exitosamente" });
  } catch (err) {
    console.error("Error al crear el privilegio:", err);
    return NextResponse.json(
      { error: "Hubo un error al crear el privilegio." },
      { status: 500 }
    );
  }
}
