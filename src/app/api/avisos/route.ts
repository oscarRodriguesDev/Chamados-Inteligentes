import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// GET: retorna todos os avisos
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const empresaIdParam = searchParams.get("empresaId");
  const empresaId = empresaIdParam ? Number(empresaIdParam) : undefined;

  const avisos = await prisma.aviso.findMany({
    where: empresaId ? { empresaID: empresaId } : {},
    include: {
      user: { select: { id: true, name: true } },
      empresa: { select: { id: true, razao: true } },
    },
  });

  return NextResponse.json(avisos);
}

// POST: cria um novo aviso
export async function POST(request: NextRequest) {
  const data = await request.json();
  const { titulo, conteudo, userId, empresaId, setor } = data;

  if (!titulo || !conteudo || !userId || !empresaId || !setor) {
    return NextResponse.json(
      { error: "Título, conteúdo, userId, empresaId e setor são obrigatórios." },
      { status: 400 }
    );
  }

  // Verifica se usuário e empresa existem
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 400 });
  }
  if (!empresa) {
    return NextResponse.json({ error: "Empresa não encontrada." }, { status: 400 });
  }

  const novoAviso = await prisma.aviso.create({
    data: {
      titulo,
      conteudo,
      setor,
      user: { connect: { id: userId } },
      empresa: { connect: { id: empresaId } },
    },
    include: {
      user: { select: { id: true, name: true } },
      empresa: { select: { id: true, razao: true } },
    },
  });

  return NextResponse.json(novoAviso, { status: 201 });
}

// PUT: atualiza um aviso existente pelo id
export async function PUT(request: NextRequest) {
  const data = await request.json();
  const { id, titulo, conteudo, userId, empresaId, setor } = data;

  if (!id || !titulo || !conteudo || !userId || !empresaId || !setor) {
    return NextResponse.json(
      { error: "ID, título, conteúdo, userId, empresaId e setor são obrigatórios." },
      { status: 400 }
    );
  }

  const avisoExistente = await prisma.aviso.findUnique({ where: { id } });
  if (!avisoExistente) {
    return NextResponse.json({ error: "Aviso não encontrado." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 400 });
  }
  if (!empresa) {
    return NextResponse.json({ error: "Empresa não encontrada." }, { status: 400 });
  }

  const avisoAtualizado = await prisma.aviso.update({
    where: { id },
    data: {
      titulo,
      conteudo,
      setor,
      user: { connect: { id: userId } },
      empresa: { connect: { id: empresaId } },
    },
    include: {
      user: { select: { id: true, name: true } },
      empresa: { select: { id: true, razao: true } },
    },
  });

  return NextResponse.json(avisoAtualizado);
}

// DELETE: remove um aviso pelo id
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const id = idParam ? Number(idParam) : null;

  if (!id) {
    return NextResponse.json(
      { error: "ID é obrigatório para deletar o aviso." },
      { status: 400 }
    );
  }

  const avisoExistente = await prisma.aviso.findUnique({ where: { id } });
  if (!avisoExistente) {
    return NextResponse.json({ error: "Aviso não encontrado." }, { status: 404 });
  }

  const removido = await prisma.aviso.delete({ where: { id } });

  return NextResponse.json(removido);
}
