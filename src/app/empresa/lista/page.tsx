"use client";
import { useEffect, useState } from "react";

// Tipagem básica para empresa
type Empresa = {
  id: number;
  razao: string;
  cnpj: string;
  botNumer: string;
};

export default function ListaEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmpresas() {
      setLoading(true);
      setErro(null);
      try {
        // Corrigido endpoint para buscar empresas cadastradas corretamente
        const res = await fetch("/api/cadastro/empresa");
        if (!res.ok) {
          throw new Error("Falha ao carregar empresas");
        }
        const data = await res.json();
        setEmpresas(Array.isArray(data.empresas) ? data.empresas : []);
      } catch (error: any) {
        setErro(error.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }
    fetchEmpresas();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Empresas cadastradas</h1>
      {loading && <div>Carregando empresas...</div>}
      {erro && <div className="text-red-600 mb-4">{erro}</div>}
      {!loading && !erro && empresas.length === 0 && (
        <div>Nenhuma empresa cadastrada.</div>
      )}
      {!loading && !erro && empresas.length > 0 && (
        <table className="min-w-full border border-gray-200 bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-4 border-b">Razão Social</th>
              <th className="text-left py-2 px-4 border-b">CNPJ</th>
              <th className="text-left py-2 px-4 border-b">Número do Bot</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((empresa) => (
              <tr key={empresa.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{empresa.razao}</td>
                <td className="py-2 px-4 border-b">{empresa.cnpj}</td>
                <td className="py-2 px-4 border-b">{empresa.botNumer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
