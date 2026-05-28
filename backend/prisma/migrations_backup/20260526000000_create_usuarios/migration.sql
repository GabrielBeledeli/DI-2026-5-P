-- CreateEnum
CREATE TYPE "UsuarioPerfil" AS ENUM ('ADMIN', 'VENDEDOR');

-- CreateTable
CREATE TABLE "usuarios" (
    "id"        SERIAL NOT NULL,
    "nome"      TEXT NOT NULL,
    "email"     TEXT NOT NULL UNIQUE,
    "senha"     TEXT NOT NULL,
    "perfil"    "UsuarioPerfil" NOT NULL DEFAULT 'VENDEDOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);
