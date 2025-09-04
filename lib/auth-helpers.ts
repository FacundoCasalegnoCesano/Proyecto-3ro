// lib/auth-helpers.ts
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  fechaNac: Date;
}

export async function createUser(userData: CreateUserData) {
  const { nombre, apellido, email, password, fechaNac } = userData;

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error("El usuario ya existe");
  }

  const fechaNacDate = fechaNac instanceof Date ? fechaNac : new Date(fechaNac);

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(password, 12);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      nombre,
      apellido,
      email,
      password: hashedPassword,
      fechaNac: fechaNacDate,
    },
  });

  // Retornar sin la contraseña
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      fechaNac: true,
      // Excluir password
    },
  });

  return user;
}