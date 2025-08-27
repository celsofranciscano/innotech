import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/db/prisma";

export async function POST(req) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Campos requeridos: email, password, firstName, lastName" },
        { status: 400 }
      );
    }


    if (email.length > 100) {
      return NextResponse.json(
        { error: "El email no puede superar 100 caracteres" },
        { status: 400 }
      );
    }
    if (firstName.length > 50 || lastName.length > 50) {
      return NextResponse.json(
        { error: "Nombre y apellido no pueden superar 50 caracteres" },
        { status: 400 }
      );
    }

    // Validación formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El email no tiene un formato válido" },
        { status: 400 }
      );
    }

    // Verificar que el email no esté registrado
    const existingUser = await prisma.tbusers.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Validación de contraseña
    if (password.length < 8 || password.length > 16) {
      return NextResponse.json(
        { error: "La contraseña debe tener entre 8 y 16 caracteres" },
        { status: 400 }
      );
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "La contraseña debe incluir al menos una letra, un número y un símbolo",
        },
        { status: 400 }
      );
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    let privilege = await prisma.tbprivileges.findUnique({
      where: { privilege: "Estudiante" },
    });
    if (!privilege) {
      privilege = await prisma.tbprivileges.create({
        data: {
          privilege: "Estudiante",
          description: "Rol por defecto para estudiantes registrados",
          actionHistory: {
            create: {
              userId: 0,
              userRole: "System",
              userName: "System",
              timestamp: new Date().toISOString(),
            },
            updates: [],
          },
        },
      });
    }


    await prisma.tbusers.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        FK_privilege: privilege.PK_privilege,
        actionHistory: {
          create: {
            userId: 0,
            userRole: "System",
            userName: "System",
            timestamp: new Date().toISOString(),
          },
          updates: [],
        },
      },
      include: { tbprivileges: true },
    });

    return NextResponse.json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al registrar el usuario", details: err.message },
      { status: 500 }
    );
  }
}
