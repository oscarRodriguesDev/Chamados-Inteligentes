"use client";

import React, { useEffect, useState } from "react";

// Incluindo setor e user no tipo Chamado
type Chamado = {
  id: string;
  titulo: string;
  data: string; // ISO date string
  status: string;
  responsavel: string;
  setor?: string;
  usuario?: {
    id: string;
    name: string;
  };
};

type FiltrosType = {
  id: string;
  titulo: string;
  data: string;
  status: string;
  responsavel: string;
  setor: string;
  usuario: string;
};

// Lista de status e setores – ajuste conforme schema
const statusOptions = [
  "",
  "ABERTO",
  "EM_ANDAMENTO",
  "FINALIZADO",
  "CANCELADO",
];

const setorOptions = [
  "",
  "RH",
  "DP",
  "TI",
  "SESMT",
  "FINANCEIRO",
  "COMERCIAL",
  "OPERACAO",
  "LOGISTICA",
];

export default function ChamadosPage() {
  const [userRole, setUserRole] = useState<string>("diretor");
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: string; name: string }[]>([]);
  const [filtros, setFiltros] = useState<FiltrosType>({
    id: "",
    titulo: "",
    data: "",
    status: "",
    responsavel: "",
    setor: "",
    usuario: "",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar chamados E usuários da empresa na API (simulação)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const empresaID = 1; // Exemplo fixo
        // Buscar chamados
        const res = await fetch(`/api/chamados?empresaID=${empresaID}`, {
          method: "GET",
        });
        if (!res.ok) throw new Error("Falha ao buscar chamados da empresa.");
        const data = await res.json();

        // Montar lista de usuários distintos a partir dos chamados, se não for buscar de uma rota /api/usuarios
        const usersFromChamados = [
          ...new Map(
            data
              .filter((c: any) => c.user && c.user.id && c.user.name)
              .map((c: any) => [
                c.user.id,
                { id: String(c.user.id), name: c.user.name },
              ])
          ).values(),
        ] as { id: string; name: string }[];

        setChamados(
          data.map((c: any) => ({
            ...c,
            responsavel: c.user?.name || c.responsavel || "",
            setor: c.setor || "",
            usuario: c.user
              ? { id: String(c.user.id), name: c.user.name }
              : undefined,
          }))
        );
        setUsuarios(usersFromChamados);
      } catch (e: any) {
        setError(e.message || "Erro ao carregar chamados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Atualiza filtros
  const handleFiltroChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value,
    });
  };

  // Limpa filtros
  const limparFiltros = () => {
    setFiltros({
      id: "",
      titulo: "",
      data: "",
      status: "",
      responsavel: "",
      setor: "",
      usuario: "",
    });
  };

  // Filtra chamados dinamicamente por TODOS os campos indicados
  const chamadosFiltrados = chamados
    .filter((c) => {
      return (
        (filtros.id === "" || String(c.id).includes(filtros.id)) &&
        (filtros.titulo === "" ||
          (c.titulo && c.titulo.toLowerCase().includes(filtros.titulo.toLowerCase()))) &&
        (filtros.data === "" || c.data === filtros.data) &&
        (filtros.status === "" ||
          (c.status && c.status.toLowerCase().includes(filtros.status.toLowerCase()))) &&
        (filtros.responsavel === "" ||
          (c.responsavel &&
            c.responsavel
              .toLowerCase()
              .includes(filtros.responsavel.toLowerCase()))) &&
        (filtros.setor === "" ||
          (c.setor && c.setor.toLowerCase() === filtros.setor.toLowerCase())) &&
        (filtros.usuario === "" ||
          (c.usuario && String(c.usuario.id) === filtros.usuario))
      );
    })
    // Corrigido: evitar erro se data for undefined/null
    .sort((a, b) => {
      const aData = a.data || "";
      const bData = b.data || "";
      return bData.localeCompare(aData);
    });

  // Controle de acesso
  const podeAcessar =
    ["diretor", "gestor", "analista"].includes(userRole.toLowerCase());

  if (!podeAcessar) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600 font-bold">
        Acesso restrito. Você não tem permissão para visualizar esta página.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Busca de Chamados</h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          className="border border-gray-300 rounded px-2 py-1"
          type="text"
          placeholder="Filtrar por ID"
          name="id"
          value={filtros.id}
          onChange={handleFiltroChange}
        />
        <input
          className="border border-gray-300 rounded px-2 py-1"
          type="text"
          placeholder="Filtrar por título"
          name="titulo"
          value={filtros.titulo}
          onChange={handleFiltroChange}
        />
        <input
          className="border border-gray-300 rounded px-2 py-1"
          type="date"
          name="data"
          value={filtros.data}
          onChange={handleFiltroChange}
        />
        <select
          className="border border-gray-300 rounded px-2 py-1"
          name="status"
          value={filtros.status}
          onChange={handleFiltroChange}
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt ? opt.charAt(0) + opt.slice(1).toLowerCase().replace(/_/g, " ") : "Status"}
            </option>
          ))}
        </select>
        <input
          className="border border-gray-300 rounded px-2 py-1"
          type="text"
          placeholder="Filtrar por responsável"
          name="responsavel"
          value={filtros.responsavel}
          onChange={handleFiltroChange}
        />
        <select
          className="border border-gray-300 rounded px-2 py-1"
          name="setor"
          value={filtros.setor}
          onChange={handleFiltroChange}
        >
          {setorOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt ? opt.charAt(0) + opt.slice(1).toLowerCase().replace(/_/g, " ") : "Setor"}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded px-2 py-1"
          name="usuario"
          value={filtros.usuario}
          onChange={handleFiltroChange}
        >
          <option value="">Usuário</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button
          onClick={limparFiltros}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
        >
          Limpar filtros
        </button>
      </div>

      {/* Estados */}
      {loading ? (
        <div className="text-center py-5 text-gray-600">
          Carregando chamados...
        </div>
      ) : error ? (
        <div className="text-center py-5 text-red-600 font-medium">{error}</div>
      ) : (
        // Tabela
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border-b">ID</th>
                <th className="px-4 py-2 border-b">Título</th>
                <th className="px-4 py-2 border-b">Data</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Responsável</th>
                <th className="px-4 py-2 border-b">Setor</th>
                <th className="px-4 py-2 border-b">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {chamadosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-5 text-gray-500 font-medium"
                  >
                    Nenhum chamado encontrado.
                  </td>
                </tr>
              ) : (
                chamadosFiltrados.map((c) => (
                  <tr key={c.id}>
                    <td className="border-b px-4 py-2">{c.id}</td>
                    <td className="border-b px-4 py-2">{c.titulo}</td>
                    <td className="border-b px-4 py-2">{c.data}</td>
                    <td className="border-b px-4 py-2">{c.status}</td>
                    <td className="border-b px-4 py-2">{c.responsavel}</td>
                    <td className="border-b px-4 py-2">{c.setor || ""}</td>
                    <td className="border-b px-4 py-2">
                      {c.usuario ? c.usuario.name : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
