import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

/**
 * GET /api/chamados?userID=ID&empresaID=ID&is_admin=true&setor=SETOR
 * - Se passar userID: retorna chamados do usuário.
 * - Se passar empresaID: retorna chamados da empresa.
 * - Se passar is_admin=true: retorna todos os chamados.
 * - Se passar setor: filtra pelo setor (pode ser combinado com outros filtros)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userID");
    const empresaID = searchParams.get("empresaID");
    const is_admin = searchParams.get("is_admin") === "true";
    const setor = searchParams.get("setor");

    // Montar condição where dinâmica
    const where: any = {};
    if (is_admin) {
      // Nenhum filtro extra
    } else if (empresaID) {
      where.empresaID = Number(empresaID);
    } else if (userID) {
      where.userId = Number(userID);
    } else if (setor) {
      // Permitir buscar somente por setor, sem user/empresa/is_admin
      // (alternativamente, pode exigir um dos filtros principais)
    } else {
      return NextResponse.json(
        { error: "É necessário passar userID, empresaID, is_admin ou setor." },
        { status: 400 }
      );
    }

    if (setor) {
      // Prisma (schema) espera ENUM, então normalizarmos para MAIUSCULO
      where.setor = setor.toUpperCase();
    }

    let chamados;
    if (is_admin) {
      chamados = await prisma.chamado.findMany({
        where: setor ? { setor: where.setor } : undefined,
        include: { user: true, empresa: true },
      });
    } else {
      chamados = await prisma.chamado.findMany({
        where,
        include: {
          user: empresaID ? true : false,
          empresa: userID ? true : false,
        },
      });
    }

    return NextResponse.json(chamados, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao buscar chamados." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chamados
 * Body: { titulo, descricao, userId, empresaID, status, setor?, prioridade? }
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { titulo, descricao, userId, empresaID, status, setor, prioridade } = data;

    if (!titulo || !descricao || !userId || !empresaID) {
      return NextResponse.json(
        { error: "Campos obrigatórios: titulo, descricao, userId, empresaID." },
        { status: 400 }
      );
    }

    const novoChamado = await prisma.chamado.create({
      data: {
        titulo,
        descricao,
        user: { connect: { id: Number(userId) } },
        empresa: { connect: { id: Number(empresaID) } },
        status: status?.toUpperCase() || "ABERTO",
        setor: setor?.toUpperCase() || "OPERACAO",
        prioridade: prioridade?.toUpperCase() || "BAIXA",
      },
    });

    return NextResponse.json(novoChamado, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar chamado." }, { status: 500 });
  }
}

/**
 * PUT /api/chamados?id=CHAMADO_ID
 * Body: campos a atualizar (titulo, descricao, status, etc)
 */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do chamado é obrigatório (via query param id)." },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { userId, empresaID, ...rest } = data;

    const updateData: any = { ...rest };

    if (userId) {
      updateData.user = { connect: { id: Number(userId) } };
    }
    if (empresaID) {
      updateData.empresa = { connect: { id: Number(empresaID) } };
    }

    const chamadoAtualizado = await prisma.chamado.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(chamadoAtualizado, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar chamado." }, { status: 500 });
  }
}

/**
 * DELETE /api/chamados?id=CHAMADO_ID
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do chamado é obrigatório (via query param id)." },
        { status: 400 }
      );
    }

    await prisma.chamado.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Chamado deletado." }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao deletar chamado." }, { status: 500 });
  }
}
