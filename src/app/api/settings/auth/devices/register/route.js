import { NextResponse, userAgent } from "next/server";
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

  try {
    const userAgentString = request.headers.get("user-agent") || "Desconocido";
    const { device, os, browser } = userAgent(request);
    const ip = request.headers.get("x-real-ip") || "Desconocida";
    const now = new Date().toISOString();

    const deviceData = {
      id: Date.now(),
      ip,
      deviceType: device.type || "Desconocido",
      brand: device.vendor || "Desconocido",
      model: device.model || "Desconocido",
      operatingSystem: os.name || "Desconocido",
      osVersion: os.version || "Desconocido",
      browser: browser.name || "Desconocido",
      browserVersion: browser.version || "Desconocido",
      userAgent: userAgentString,
      firstLoginAt: now,
      lastLoginAt: now, // Cambiado de lastUsedAt
      lastOnlineAt: now, // Cambiado de lastActiveAt
      loginCount: 1,
      isActiveSession: true,
      lastSessionClosedAt: null,
    };

    const userId = parseInt(token.user.id);

    const userExists = await prisma.tbusers.findUnique({
      where: { PK_user: userId },
    });

    if (!userExists) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado. No se puede registrar el dispositivo.",
        },
        { status: 404 }
      );
    }

    const existing = await prisma.tbdevices.findUnique({
      where: { FK_user: userId },
    });

    if (existing) {
      return NextResponse.json(
        {
          message:
            "El usuario ya tiene dispositivos registrados. No se puede registrar otro.",
        },
        { status: 409 }
      ); // 409 Conflict
    }

    const created = await prisma.tbdevices.create({
      data: {
        FK_user: userId,
        devices: [deviceData],
      },
    });

    return NextResponse.json({
      message: "Dispositivo registrado exitosamente",
      device: created,
    });
  } catch (error) {
    console.error("Error al registrar el dispositivo:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el dispositivo" },
      { status: 500 }
    );
  }
}
