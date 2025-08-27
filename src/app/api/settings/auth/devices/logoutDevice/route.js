//  /api/settings/auth/devices/logoutDevice

import { NextResponse, userAgent } from "next/server";
import prisma from "@/lib/db/prisma";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

export async function POST(request) {
  // 1. Verificar token y que tenga rol Superadministrador
  const { token, error, status } = await tokenVerification(request, [
    "Superadministrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    // 2. Extraer deviceId y userId del body (usuario y dispositivo objetivo)
    const { deviceId, userId } = await request.json();

    if (!deviceId || !userId) {
      return NextResponse.json(
        { error: "Falta deviceId o userId para cerrar sesión." },
        { status: 400 }
      );
    }

    // 3. Buscar dispositivos del usuario objetivo
    const record = await prisma.tbdevices.findUnique({
      where: { FK_user: userId },
    });

    if (!record) {
      return NextResponse.json(
        { error: "No se encontraron dispositivos para el usuario indicado." },
        { status: 404 }
      );
    }

    // 4. Obtener dispositivo actual (el que hace la petición)
    const { device, os, browser } = userAgent(request);
    const userAgentString = request.headers.get("user-agent") || "Desconocido";
    const ip = request.headers.get("x-real-ip") || "Desconocida";

    const currentDevice = {
      deviceType: device.type || "Desconocido",
      brand: device.vendor || "Desconocido",
      model: device.model || "Desconocido",
      operatingSystem: os.name || "Desconocido",
      browser: browser.name || "Desconocido",
      ip,
      userAgent: userAgentString,
    };

    // 5. Buscar el dispositivo que se va a cerrar sesión
    const devices = [...record.devices];
    const idx = devices.findIndex((d) => d.id === deviceId);

    if (idx === -1) {
      return NextResponse.json(
        { error: "No se encontró el dispositivo con ese ID." },
        { status: 404 }
      );
    }

    const targetDevice = devices[idx];

    // 6. Cerrar sesión en ese dispositivo
    const now = new Date().toISOString();
    devices[idx].isActiveSession = false;
    devices[idx].lastSessionClosedAt = now;

    await prisma.tbdevices.update({
      where: { PK_device: record.PK_device },
      data: {
        devices,
        updatedAt: new Date(),
      },
    });

    // 7. Determinar si el dispositivo cerrado es:
    //    - del mismo usuario que hace la petición
    //    - y coincide con el dispositivo actual (por campos clave)
    const isSameUser = token.user.id === userId.toString();

    const isCurrentDevice =
      isSameUser &&
      targetDevice.deviceType === currentDevice.deviceType &&
      targetDevice.brand === currentDevice.brand &&
      targetDevice.model === currentDevice.model &&
      targetDevice.operatingSystem === currentDevice.operatingSystem &&
      targetDevice.browser === currentDevice.browser;

    // 8. Responder con la info y el flag para el frontend
    return NextResponse.json({
      message: "Sesión cerrada correctamente.",
      closedDeviceId: deviceId,
      isCurrentDevice,
    });
  } catch (e) {
    console.error("Error cerrando sesión por ID de dispositivo:", e);
    return NextResponse.json(
      { error: "No se pudo cerrar la sesión del dispositivo." },
      { status: 500 }
    );
  }
}
