import { NextResponse, userAgent } from "next/server";
import prisma from "@/lib/db/prisma";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

// Comparación laxa de dispositivos (ignora campos temporales)
const isSameDeviceLoosely = (existing, incoming) =>
  existing.deviceType === incoming.deviceType &&
  existing.brand === incoming.brand &&
  existing.model === incoming.model &&
  existing.operatingSystem === incoming.operatingSystem &&
  existing.browser === incoming.browser;

export async function GET(request) {
  // 1. Verificar token y permisos
  const { token, error, status } = await tokenVerification(request, [
    "Cliente",
    "Administrador",
    "Superadministrador",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    // 2. Extraer datos de cabecera del dispositivo
    const userAgentString = request.headers.get("user-agent") || "Desconocido";
    const { device, os, browser } = userAgent(request);
    const ip = request.headers.get("x-real-ip") || "Desconocida";
    const now = new Date().toISOString();
    const userId = parseInt(token.user.id);

    // 3. Preparar objeto de comparación
    const incoming = {
      id: 0,
      ip,
      deviceType: device.type || "Desconocido",
      brand: device.vendor || "Desconocido",
      model: device.model || "Desconocido",
      operatingSystem: os.name || "Desconocido",
      osVersion: os.version || "Desconocido",
      browser: browser.name || "Desconocido",
      browserVersion: browser.version || "Desconocido",
      userAgent: userAgentString,
      firstLoginAt: "",
      lastLoginAt: "",
      lastOnlineAt: "",
      isActiveSession: false,
      loginCount: 0,
      lastSessionClosedAt: now,
    };

    // 4. Verificar existencia del usuario y dispositivos
    const record = await prisma.tbdevices.findUnique({
      where: { FK_user: userId },
    });

    if (!record || !record.devices || record.devices.length === 0) {
      // Si no hay usuario o dispositivos, cerrar sesión local forzada
      return NextResponse.json({
        message:
          "Usuario o dispositivo no encontrados. La sesión ha sido cerrada localmente.",
        isActiveSession: false,
        lastSessionClosedAt: now,
      });
    }

    // 5. Buscar dispositivo activo
    const devices = [...record.devices];
    const idx = devices.findIndex(
      (d) => isSameDeviceLoosely(d, incoming) && d.isActiveSession
    );

    if (idx === -1) {
      return NextResponse.json({ isActiveSession: false }, { status: 200 });
    }

    // 6. Cerrar sesión
    devices[idx].isActiveSession = false;
    devices[idx].lastSessionClosedAt = now;

    await prisma.tbdevices.update({
      where: { PK_device: record.PK_device },
      data: {
        devices,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Sesión cerrada correctamente en este dispositivo.",
      isActiveSession: false,
      lastSessionClosedAt: now,
    });
  } catch (e) {
    console.error("Error cerrando sesión del dispositivo:", e);
    return NextResponse.json(
      {
        error:
          "Error inesperado. La sesión se cerrará localmente como medida de seguridad.",
        isActiveSession: false,
      },
      { status: 500 }
    );
  }
}
