CREATE TABLE "clientes" (
    "id"           SERIAL NOT NULL,
    "nome"         TEXT NOT NULL,
    "email"        TEXT NOT NULL UNIQUE,
    "cidade"       TEXT NOT NULL,
    "estado"       TEXT NOT NULL,
    "pais"         TEXT NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);
