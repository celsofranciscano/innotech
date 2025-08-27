import { NextResponse, userAgent } from "next/server";
import prisma from "@/lib/db/prisma";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

// Comparación laxa entre dispositivos
const isSameDeviceLoosely = (existingDevice, incomingDevice) =>
  existingDevice.deviceType === incomingDevice.deviceType &&
  existingDevice.brand === incomingDevice.brand &&
  existingDevice.model === incomingDevice.model &&
  existingDevice.operatingSystem === incomingDevice.operatingSystem &&
  existingDevice.browser === incomingDevice.browser;

export async function GET(request) {
  console.log("[DEVICE] Inicio GET /api/settings/auth/devices/login");

  const { token, error, status } = await tokenVerification(request, [
    "Estudiante",
    "Administrador",
    "Superadministrador",
  ]);
  console.log("[DEVICE] tokenVerification result:", { token, error, status });

  if (error) {
    console.log("[DEVICE] tokenVerification falló");
    return NextResponse.json({ error }, { status });
  }

  try {
    const userAgentString = request.headers.get("user-agent") || "Desconocido";
    const { device, os, browser } = userAgent(request);
    const ip = request.headers.get("x-real-ip") || "Desconocida";
    const now = new Date().toISOString();

    console.log("[DEVICE] Datos de usuario y userAgent:", {
      userAgentString,
      device,
      os,
      browser,
      ip,
    });

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
      lastLoginAt: now,
      lastOnlineAt: now,
      isActiveSession: true,
      loginCount: 1,
      lastSessionClosedAt: null,
    };

    const userId = parseInt(token.user.id);
    console.log("[DEVICE] userId obtenido del token:", userId);

    const userExists = await prisma.tbusers.findUnique({
      where: { PK_user: userId },
    });
    console.log("[DEVICE] userExists:", userExists);

    if (!userExists) {
      console.log("[DEVICE] Usuario no encontrado");
      return NextResponse.json(
        { error: "Usuario no encontrado. No se puede actualizar el dispositivo." },
        { status: 404 }
      );
    }

    const existing = await prisma.tbdevices.findUnique({
      where: { FK_user: userId },
    });
    console.log("[DEVICE] existing devices:", existing);

    if (!existing) {
      console.log("[DEVICE] No hay dispositivos previos, creando uno nuevo");
      const created = await prisma.tbdevices.create({
        data: {
          FK_user: userId,
          devices: [deviceData],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log("[DEVICE] Dispositivo creado:", created);
      return NextResponse.json({
        message: "Dispositivo registrado correctamente (nuevo registro creado).",
        device: created,
      });
    }

    const existingDevices = existing.devices;
    const updatedDevices = [...existingDevices];

    const index = updatedDevices.findIndex((d) =>
      isSameDeviceLoosely(d, deviceData)
    );
    console.log("[DEVICE] index del dispositivo existente:", index);

    if (index === -1) {
      console.log("[DEVICE] Nuevo dispositivo detectado, agregando a la lista");
      updatedDevices.push(deviceData);
    } else {
      console.log("[DEVICE] Dispositivo existente, actualizando datos");
      updatedDevices[index] = {
        ...updatedDevices[index],
        lastLoginAt: now,
        lastOnlineAt: now,
        isActiveSession: true,
        loginCount: updatedDevices[index].loginCount + 1,
      };
    }

    const updated = await prisma.tbdevices.update({
      where: { PK_device: existing.PK_device },
      data: {
        devices: updatedDevices,
        updatedAt: new Date(),
      },
    });

    console.log("[DEVICE] Dispositivo actualizado:", updated);

    return NextResponse.json({
      message: "La información del dispositivo se ha actualizado correctamente.",
      device: updated,
    });
  } catch (error) {
    console.error("[DEVICE] Error al actualizar el dispositivo:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el dispositivo" },
      { status: 500 }
    );
  }
}
