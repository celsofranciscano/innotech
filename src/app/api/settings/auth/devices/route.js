import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

export async function GET(request) {
  const { token, error, status } = await tokenVerification(request, [
    "Cliente",
    "Administrador",
    "Superadministrador",
  ]);

  if (error) {
    return NextResponse.json({ error }, { status });
  }
  console.log(token);
  try {
    const userId = parseInt(token.user.id);

    const userExists = await prisma.tbusers.findUnique({
      where: { PK_user: userId },
    });

    if (!userExists) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado.",
        },
        { status: 404 }
      );
    }
    // Guardar el dispositivo en la base de datos en la tabla tbdevices
    const devices = await prisma.tbdevices.findUnique({
      where: {
        FK_user: parseInt(token.user.id),
      },
    });

    return NextResponse.json(devices);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo seleccionar los sipositivos" },
      { status: 500 }
    );
  }
}
