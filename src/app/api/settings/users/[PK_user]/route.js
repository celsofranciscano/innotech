// /api/settings/users/[PK_user]/route.ts
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { tokenVerification } from "@/utils/tokens/tokenVerification";

const ALLOWED_PRIVILEGES = [
  "Superadministrador",
  "Coordinador",
  "Supervisor",
  "Invitado",
];

/// --------------------------------------
/// GET: Obtener un usuario por ID
/// Accesible para: Superadministrador, Coordinador, Supervisor, Invitado
/// --------------------------------------
export async function GET(request, { params }) {
  const { status, error } = await tokenVerification(
    request,
    ALLOWED_PRIVILEGES
  );
  if (error) return NextResponse.json({ error }, { status });

  const { PK_user } = params;
  if (!PK_user || isNaN(Number(PK_user)) || Number(PK_user) <= 0) {
    return NextResponse.json(
      { error: "El parámetro 'PK_user' debe ser un número entero positivo." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.tbusers.findUnique({
      where: { PK_user: Number(PK_user) },
      select: {
        PK_user: true,
        FK_privilege: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        actionHistory: true,
        tbprivileges: { select: { privilege: true } },
        tbdevices: { select: { devices: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: `No se encontró usuario con ID ${PK_user}.` },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener usuario." },
      { status: 500 }
    );
  }
}

/// --------------------------------------
/// PATCH: Actualizar usuario por ID
/// Accesible para: Superadministrador, Coordinador, Supervisor
/// --------------------------------------
export async function PATCH(request, { params }) {
  const { token, status, error } = await tokenVerification(request, [
    "Superadministrador",
    "Coordinador",
    "Supervisor",
  ]);
  if (error) return NextResponse.json({ error }, { status });

  const { PK_user } = params;
  if (!PK_user || isNaN(Number(PK_user)) || Number(PK_user) <= 0) {
    return NextResponse.json(
      { error: "El parámetro 'PK_user' debe ser un número entero positivo." },
      { status: 400 }
    );
  }

  try {
    const { firstName, lastName, email, FK_privilege } = await request.json();

    const currentUser = await prisma.tbusers.findUnique({
      where: { PK_user: Number(PK_user) },
    });
    if (!currentUser)
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );

    // ——— Validaciones de nombre ———
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/;
    for (const [field, value] of [
      ["firstName", firstName],
      ["lastName", lastName],
    ]) {
      if (
        value &&
        (typeof value !== "string" ||
          !value.trim() ||
          !nameRegex.test(value) ||
          value.length < 2 ||
          value.length > 50)
      ) {
        return NextResponse.json(
          {
            error: `El campo '${field}' debe tener entre 2 y 50 caracteres y solo puede contener letras y espacios.`,
          },
          { status: 400 }
        );
      }
    }

    // ——— Validación email ———
    if (email) {
      const emailTrimmed = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(emailTrimmed))
        return NextResponse.json(
          { error: "Formato de correo electrónico inválido." },
          { status: 400 }
        );
      if (emailTrimmed !== currentUser.email) {
        const emailExists = await prisma.tbusers.findUnique({
          where: { email: emailTrimmed },
        });
        if (emailExists)
          return NextResponse.json(
            { error: "Ya existe un usuario con ese correo." },
            { status: 400 }
          );
      }
    }

    // ——— Validación FK_privilege ———
    if (FK_privilege !== undefined) {
      if (!Number.isInteger(FK_privilege) || FK_privilege <= 0) {
        return NextResponse.json(
          {
            error:
              "El campo 'FK_privilege' debe ser un número entero positivo.",
          },
          { status: 400 }
        );
      }
      const privilege = await prisma.tbprivileges.findUnique({
        where: { PK_privilege: FK_privilege },
      });
      if (!privilege || !ALLOWED_PRIVILEGES.includes(privilege.privilege)) {
        return NextResponse.json(
          {
            error: `Solo se permiten privilegios: ${ALLOWED_PRIVILEGES.join(
              ", "
            )}.`,
          },
          { status: 400 }
        );
      }
    }

    // ——— Actualizar historial ———
    let history = currentUser.actionHistory || { create: {}, updates: [] };
    if (typeof history === "string") {
      try {
        history = JSON.parse(history);
      } catch {
        history = { create: {}, updates: [] };
      }
    }

    const changes= {};
    if (firstName && firstName !== currentUser.firstName)
      changes.firstName = { old: currentUser.firstName, new: firstName };
    if (lastName && lastName !== currentUser.lastName)
      changes.lastName = { old: currentUser.lastName, new: lastName };
    if (email && email !== currentUser.email)
      changes.email = { old: currentUser.email, new: email };
    if (FK_privilege && FK_privilege !== currentUser.FK_privilege)
      changes.FK_privilege = {
        old: currentUser.FK_privilege,
        new: FK_privilege,
      };

    if (Object.keys(changes).length === 0)
      return NextResponse.json(
        { message: "No se realizaron cambios." },
        { status: 200 }
      );

    const updateRecord = {
      userId: Number(token.user.id),
      userRole: token.privilege,
      userName: `${token.user.firstName} ${token.user.lastName}`,
      timestamp: new Date().toISOString(),
      changes,
    };
    history.updates = [...(history.updates || []), updateRecord];

    const updatedUser = await prisma.tbusers.update({
      where: { PK_user: Number(PK_user) },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        FK_privilege: FK_privilege || undefined,
        updatedAt: new Date(),
        actionHistory: history,
      },
    });

    return NextResponse.json({
      message: "Usuario actualizado con éxito.",
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    return NextResponse.json(
      { error: "Error interno al actualizar usuario." },
      { status: 500 }
    );
  }
}
