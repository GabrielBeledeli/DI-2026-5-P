-- CreateEnum
CREATE TYPE "UsuarioPerfil" AS ENUM ('GESTOR', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "VendaStatus" AS ENUM ('CONCLUIDA', 'CANCELADO', 'PENDENTE_PAGAMENTO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "perfil" "UsuarioPerfil" NOT NULL DEFAULT 'VENDEDOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "cidade" VARCHAR(100) NOT NULL,
    "estado" VARCHAR(2) NOT NULL,
    "pais" VARCHAR(60) NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(60) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" BIGSERIAL NOT NULL,
    "categoriaId" BIGINT,
    "marca" VARCHAR(100) NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "cor" VARCHAR(50) NOT NULL,
    "genero" VARCHAR(20) NOT NULL,
    "tamanho" VARCHAR(10) NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" BIGSERIAL NOT NULL,
    "usuarioId" BIGINT,
    "clienteId" BIGINT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" "VendaStatus" NOT NULL DEFAULT 'PENDENTE_PAGAMENTO',
    "dataVenda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_itens" (
    "id" BIGSERIAL NOT NULL,
    "vendaId" BIGINT NOT NULL,
    "produtoId" BIGINT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "venda_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
