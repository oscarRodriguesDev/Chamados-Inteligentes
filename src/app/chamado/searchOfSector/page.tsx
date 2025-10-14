"use client";

import { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";

type Chamado = {
  id: number;
  empresaID: number;
  userId: number;
  titulo: string;
  setor: string;
  descricao: string;
  fotos?: string | null;
  status: string;
  prioridade: string;
  criadoEm: string;
  atualizadoEm: string;
};

export default function BuscarChamadosPorSetor() {
  const [setor, setSetor] = useState("");
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBusca = async (setorBusca: string) => {
    setLoading(true);
    setError(null);
    setChamados([]);
    try {
      if (!setorBusca) {
        setError("Informe o setor para buscar.");
        setLoading(false);
        return;
      }
      // O endpoint espera setor em maiúsculo
      const setorFinal = setorBusca.trim().toUpperCase();
      const res = await fetch(`/api/chamados?setor=${encodeURIComponent(setorFinal)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        let msg = `Erro ao buscar chamados (status ${res.status})`;
        try {
          const body = await res.json();
          if (body?.error) msg = body.error;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      setChamados(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleSetorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSetor(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleBusca(setor);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Buscar Chamados por Setor</h1>
      <form onSubmit={handleSubmit} className="flex items-center gap-4 mb-6">
        <Input
          value={setor}
          onChange={handleSetorChange}
          placeholder="Digite o setor (ex: TI, RH, OPERACAO...)"
          className="w-60"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
          disabled={loading || !setor.trim()}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

      {!loading && !error && chamados.length === 0 && (
        <div>Nenhum chamado encontrado para o setor informado.</div>
      )}

      {chamados.length > 0 && (
        <div className="space-y-4">
          {chamados.map((chamado) => (
            <div key={chamado.id} className="border rounded-lg p-4 bg-white shadow">
              <h2 className="font-semibold text-lg">{chamado.titulo}</h2>
              <div className="text-sm text-gray-700 mb-1">
                <span className="font-medium">EmpresaID:</span> {chamado.empresaID}{" "}
                <span className="ml-4 font-medium">UsuárioID:</span> {chamado.userId}
              </div>
              <div className="text-gray-600 mb-2">
                Setor: <span className="font-medium">{chamado.setor}</span>
              </div>
              <div className="text-gray-700 mb-2">Descrição: {chamado.descricao}</div>
              <div className="flex gap-4 text-sm text-gray-500">
                <div>
                  Status: <span className="font-semibold">{chamado.status}</span>
                </div>
                <div>
                  Prioridade: <span className="font-semibold">{chamado.prioridade}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Criado em: {new Date(chamado.criadoEm).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

