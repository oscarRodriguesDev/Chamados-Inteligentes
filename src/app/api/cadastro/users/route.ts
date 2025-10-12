import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/src/lib/prisma";






export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, rules, setor, empresaId, cpf, telefone, token } = body;

    if (!name || !email || !password || !rules || !setor || !empresaId || !cpf || !telefone || !token) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, email, password, rules, setor, empresaId, cpf, telefone, token" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: "Usuário já cadastrado com este email" }, { status: 409 });

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        rules,
        setor,
        cpf,
        telefone,
        token,
        empresa: { connect: { id: empresaId } },
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ message: "Usuário cadastrado com sucesso", user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao cadastrar usuário", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (idParam) {
      const id = Number(idParam);
      if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true, name: true, email: true, rules: true, setor: true,
          cpf: true, telefone: true, token: true, empresaID: true, createdAt: true, updatedAt: true,
        },
      });

      if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
      return NextResponse.json({ user }, { status: 200 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, rules: true, setor: true,
        cpf: true, telefone: true, token: true, empresaID: true, createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuário(s)", details: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    let { id, name, email, rules, setor, cpf, telefone, token, password, empresaId } = body;

    if (!id || !name || !email || !rules || !setor || !cpf || !telefone || !empresaId) {
      return NextResponse.json({ error: "Campos obrigatórios: id, name, email, rules, setor, cpf, telefone, empresaId" }, { status: 400 });
    }

    id = Number(id);
    empresaId = Number(empresaId);
    if (isNaN(id) || isNaN(empresaId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    const updateData: any = { name, email, rules, setor, cpf, telefone, token, empresa: { connect: { id: empresaId } } };
    if (password) updateData.password = await hash(password, 10);

    const updatedUser = await prisma.user.update({ where: { id }, data: updateData });
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ message: "Usuário atualizado com sucesso", user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao atualizar usuário", details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    if (!idParam) return NextResponse.json({ error: "Campo obrigatório: id" }, { status: 400 });

    const id = Number(idParam);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Usuário deletado com sucesso" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao deletar usuário", details: (error as Error).message }, { status: 500 });
  }
}
