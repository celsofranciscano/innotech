// /api/settings/auth/devices/update.ts
import { NextResponse, userAgent } from "next/server";
import prisma from "@/lib/db/prisma";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

const isSameDeviceLoosely = (existingDevice, incomingDevice) =>
  existingDevice.deviceType === incomingDevice.deviceType &&
  existingDevice.brand === incomingDevice.brand &&
  existingDevice.model === incomingDevice.model &&
  existingDevice.operatingSystem === incomingDevice.operatingSystem &&
  existingDevice.browser === incomingDevice.browser;

export async function GET(request) {
  const { token, error, status } = await tokenVerification(request, [
    "Estudiante",
    "Administrador",
    "Superadministrador",
  ]);
  if (error) {
    console.log("[AuthError] Token inválido o sin permisos:", {
      error,
      status,
    });
    return NextResponse.json({ forceLogout: true }, { status });
  }

  try {
    const userAgentString = request.headers.get("user-agent") || "Desconocido";
    const ip = request.headers.get("x-real-ip") || "Desconocida";
    const { device, os, browser } = userAgent(request);
    const now = new Date().toISOString();
    const userId = parseInt(token.user.id);

    // console.log("[DeviceUpdate] User ID:", userId);
    // console.log("[DeviceUpdate] Incoming headers:", { userAgentString, ip });

    // Buscar los dispositivos del usuario
    const existing = await prisma.tbdevices.findUnique({
      where: { FK_user: userId },
    });

    // console.log("[DeviceUpdate] Existing devices record:", existing);

    if (
      !existing ||
      !Array.isArray(existing.devices) ||
      existing.devices.length === 0
    ) {
      // console.log(
      //   "[DeviceUpdate] No hay dispositivos registrados. Forzando logout."
      // );
      return NextResponse.json({ forceLogout: true }, { status: 200 });
    }

    const incomingDevice = {
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
      lastOnlineAt: now,
      isActiveSession: true,
      loginCount: 0,
      lastSessionClosedAt: null,
    };

    // console.log("[DeviceUpdate] Incoming device:", incomingDevice);

    const index = existing.devices.findIndex((d) =>
      isSameDeviceLoosely(d, incomingDevice)
    );

    // console.log("[DeviceUpdate] Device match index:", index);

    if (index === -1) {
      // console.log(
      //   "[DeviceUpdate] Ningún dispositivo coincide. Forzando logout."
      // );
      return NextResponse.json({ forceLogout: true }, { status: 200 });
    }

    if (!existing.devices[index].isActiveSession) {
      // console.log(
      //   "[DeviceUpdate] Dispositivo encontrado pero sesión inactiva. Forzando logout."
      // );
      return NextResponse.json({ forceLogout: true }, { status: 200 });
    }

    const updatedDevices = [...existing.devices];
    updatedDevices[index].lastOnlineAt = now;

    console.log(
      "[DeviceUpdate] Actualizando dispositivo en BD:",
      updatedDevices[index]
    );

    await prisma.tbdevices.update({
      where: { PK_device: existing.PK_device },
      data: {
        devices: updatedDevices,
        updatedAt: new Date(),
      },
    });

    // console.log("[DeviceUpdate] Última actividad actualizada correctamente.");

    return NextResponse.json({
      message: "Última actividad actualizada.",
      lastOnlineAt: now,
      isActiveSession: true,
    });
  } catch (error) {
    console.error(
      "[DeviceUpdate][Error] Al actualizar la última actividad:",
      error
    );
    return NextResponse.json({ forceLogout: true }, { status: 500 });
  }
}
