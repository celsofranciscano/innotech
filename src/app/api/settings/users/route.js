// /api/settings/users/route.ts

// /api/settings/users/route.ts
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";
import bcrypt from "bcrypt";

// Privilegios permitidos para crear usuarios
const ALLOWED_PRIVILEGES = ["Superadministrador", "Coordinador", "Supervisor", "Invitado"];

export async function GET(request) {
  const { status, error } = await tokenVerification(request, ALLOWED_PRIVILEGES);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const users = await prisma.tbusers.findMany({
      select: {
        PK_user: true,
        FK_privilege: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        tbprivileges: { select: { privilege: true } },
        tbdevices: { select: { devices: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const processedUsers = users.map(user => {
      let lastDeviceData = null;
      if (user.tbdevices?.devices && Array.isArray(user.tbdevices.devices)) {
        const sorted = [...user.tbdevices.devices].sort(
          (a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
        );
        if (sorted.length > 0) {
          const lastUsed = sorted[0];
          lastDeviceData = {
            lastOnlineAt: lastUsed.lastOnlineAt,
            isActiveSession: lastUsed.isActiveSession,
            lastSessionClosedAt: lastUsed.lastSessionClosedAt,
          };
        }
      }

      return {
        PK_user: user.PK_user,
        FK_privilege: user.FK_privilege,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        tbprivileges: user.tbprivileges,
        lastDevice: lastDeviceData,
      };
    });

    return NextResponse.json(processedUsers);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return NextResponse.json({ error: "Error interno del servidor al obtener usuarios." }, { status: 500 });
  }
}

export async function POST(request) {
  const { token, status, error } = await tokenVerification(request, ["Superadministrador","Coordinador","Supervisor"]);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const { firstName, lastName, email, password, FK_privilege } = await request.json();

    // Validación de privilegio
    if (!Number.isInteger(FK_privilege) || FK_privilege <= 0) {
      return NextResponse.json({ error: "El campo 'FK_privilege' debe ser un número entero positivo." }, { status: 400 });
    }
    const privilege = await prisma.tbprivileges.findUnique({ where: { PK_privilege: FK_privilege } });
    if (!privilege || !ALLOWED_PRIVILEGES.includes(privilege.privilege)) {
      return NextResponse.json({ error: `Solo se permiten privilegios: ${ALLOWED_PRIVILEGES.join(", ")}.` }, { status: 400 });
    }

    // Validaciones de nombre
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/;
    for (const [field, value] of [["firstName", firstName], ["lastName", lastName]]) {
      if (!value || typeof value !== "string" || !value.trim()) {
        return NextResponse.json({ error: `El campo '${field}' es obligatorio.` }, { status: 400 });
      }
      if (value.length < 2 || value.length > 50 || !nameRegex.test(value)) {
        return NextResponse.json({ error: `El campo '${field}' debe tener entre 2 y 50 caracteres y solo puede contener letras y espacios.` }, { status: 400 });
      }
    }

    // Validación email
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "El campo 'email' es obligatorio." }, { status: 400 });
    }
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(emailTrimmed)) {
      return NextResponse.json({ error: "El formato de correo electrónico no es válido." }, { status: 400 });
    }
    const emailExists = await prisma.tbusers.findUnique({ where: { email: emailTrimmed } });
    if (emailExists) return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 400 });

    // Validación de password
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "El campo 'password' es obligatorio." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 30 || /\s/.test(password) ||
        !/(?=.*[A-Za-z])/.test(password) || !/(?=.*\d)/.test(password) ||
        !/(?=.*[@$!%*?&^#_+={}\[\]:;"'<>,.`|\\/-])/.test(password)) {
      return NextResponse.json({ error: "La contraseña debe tener entre 8 y 30 caracteres, sin espacios, e incluir al menos una letra, un número y un carácter especial." }, { status: 400 });
    }

    // Crear historial
    const actionHistory = {
      create: { userId: Number(token.user.id), userRole: token.privilege, userName: `${token.user.firstName} ${token.user.lastName}`, timestamp: new Date().toISOString() },
      updates: []
    };

    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.tbusers.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailTrimmed,
        password: hashedPassword,
        FK_privilege,
        actionHistory
      }
    });

    return NextResponse.json({ message: "Usuario creado exitosamente." }, { status: 201 });
  } catch (err) {
    console.error("Error al crear usuario:", err);
    return NextResponse.json({ error: "Ocurrió un error al crear el usuario." }, { status: 500 });
  }
}
