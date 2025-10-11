-- CreateEnum
CREATE TYPE "RULES" AS ENUM ('SYSTEM_ADMIN', 'ADMIN_ORG', 'DIRETOR', 'GESTOR', 'ANALISTA', 'OPERADOR');

-- CreateEnum
CREATE TYPE "setor" AS ENUM ('RH', 'DP', 'TI', 'SESMT', 'FINANCEIRO', 'COMERCIAL', 'OPERACAO', 'LOGISTICA');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ABERTO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "razao" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "botNumer" TEXT NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "empresaID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "rules" "RULES" NOT NULL DEFAULT 'OPERADOR',
    "setor" "setor" NOT NULL DEFAULT 'OPERACAO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chamado" (
    "id" SERIAL NOT NULL,
    "empresaID" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "setor" "setor" NOT NULL,
    "descricao" TEXT NOT NULL,
    "fotos" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ABERTO',
    "prioridade" "Prioridade" NOT NULL DEFAULT 'BAIXA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aviso" (
    "id" SERIAL NOT NULL,
    "empresaID" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "setor" "setor" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_empresaID_fkey" FOREIGN KEY ("empresaID") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_empresaID_fkey" FOREIGN KEY ("empresaID") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_empresaID_fkey" FOREIGN KEY ("empresaID") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
