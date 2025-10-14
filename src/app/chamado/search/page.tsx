"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

export default function ChamadosPorPerfil() {
  const { data: session, status } = useSession();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    // se não houver usuário logado
    if (!session?.user) {
      setChamados([]);
      setLoading(false);
      return;
    }

    // Normaliza propriedades: alguns setups colocam 'role', outros 'rules'
    const userAny = session.user as any;
    const role = (userAny.role || userAny.rules || "").toString();
    const logadoID = Number(userAny.id || userAny.userId || userAny.sub); // tenta várias chaves
    const empresaID = Number(userAny.empresaID || userAny.empresaId || userAny.companyId);

    // Constrói URL compatível com o endpoint
    let apiUrl = "/api/chamados";

    if (role === "SYSTEM_ADMIN") {
      apiUrl += "?is_admin=true";
    } else if (role === "ADMIN_ORG" || role === "DIRETOR") {
      if (!empresaID) {
        setError("Empresa do usuário não disponível na sessão.");
        setLoading(false);
        return;
      }
      apiUrl += `?empresaID=${empresaID}`;
    } else {
      if (!logadoID) {
        setError("ID do usuário não disponível na sessão.");
        setLoading(false);
        return;
      }
      apiUrl += `?userID=${logadoID}`;
    }

    setLoading(true);
    setError(null);

    fetch(apiUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          // tenta pegar mensagem do body
          let msg = `Erro ao buscar chamados (status ${res.status})`;
          try {
            const body = await res.json();
            if (body?.error) msg = body.error;
          } catch (e) {
            /* noop */
          }
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data) => {
        // garante array mesmo que o backend retorne null/undefined
        setChamados(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err?.message || "Erro desconhecido");
      })
      .finally(() => setLoading(false));
  }, [session, status]);

  // Título: usa o mesmo campo que verificamos acima
  const userAny = (session?.user as any) || {};
  const roleForTitle = (userAny.role || userAny.rules || "").toString();
  let titulo = "Chamados";
  if (roleForTitle === "SYSTEM_ADMIN") titulo = "Todos os Chamados";
  else if (roleForTitle === "ADMIN_ORG" || roleForTitle === "DIRETOR")
    titulo = "Chamados da Empresa";
  else if (userAny.name) titulo = "Seus Chamados";

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">{titulo}</h1>

      {loading && <div>Carregando chamados...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && chamados.length === 0 && (
        <div>Nenhum chamado encontrado.</div>
      )}

      {!loading && !error && chamados.length > 0 && (
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
