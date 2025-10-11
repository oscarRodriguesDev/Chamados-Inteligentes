import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { razao, cnpj, botNumer } = body;

    if (!razao || !cnpj || !botNumer) {
      return NextResponse.json(
        { error: "Campos obrigatórios: razao, cnpj, botNumer" },
        { status: 400 }
      );
    }

    // Verifica se empresa já existe pelo CNPJ
    const empresaExistente = await prisma.empresa.findUnique({
      where: { cnpj },
    });

    if (empresaExistente) {
      return NextResponse.json(
        { error: "Empresa já cadastrada com este CNPJ" },
        { status: 409 }
      );
    }

    const empresa = await prisma.empresa.create({
      data: {
        razao,
        cnpj,
        botNumer,
      },
    });

    return NextResponse.json(
      { message: "Empresa cadastrada com sucesso", empresa },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao cadastrar empresa", details: (error as Error).message },
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
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "ID inválido. Deve ser um número." },
          { status: 400 }
        );
      }
      // Busca empresa por id
      const empresa = await prisma.empresa.findUnique({
        where: { id },
      });

      if (!empresa) {
        return NextResponse.json(
          { error: "Empresa não encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json({ empresa }, { status: 200 });
    } else {
      // Lista todas as empresas
      const empresas = await prisma.empresa.findMany();
      return NextResponse.json({ empresas }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar empresa(s)", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    let { id, razao, cnpj, botNumer } = body;

    if (id === undefined || id === null || !razao || !cnpj || !botNumer) {
      return NextResponse.json(
        { error: "Campos obrigatórios: id, razao, cnpj, botNumer" },
        { status: 400 }
      );
    }

    id = Number(id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido. Deve ser um número." },
        { status: 400 }
      );
    }

    const empresa = await prisma.empresa.update({
      where: { id },
      data: { razao, cnpj, botNumer },
    });

    return NextResponse.json(
      { message: "Empresa atualizada com sucesso", empresa },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao atualizar empresa", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "Campo obrigatório: id" },
        { status: 400 }
      );
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido. Deve ser um número." },
        { status: 400 }
      );
    }

    // Verifica se empresa existe
    const empresaExistente = await prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresaExistente) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    await prisma.empresa.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Empresa deletada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao deletar empresa", details: (error as Error).message },
      { status: 500 }
    );
  }
}
