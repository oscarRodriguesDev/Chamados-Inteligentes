"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Aviso = {
  id: number;
  titulo: string;
  conteudo: string;
  criadoEm: string;
  user: { id: number; name: string };
  empresa: { id: number; razao: string };
};

export default function AvisosPorEmpresaPage() {
  const params = useParams();
  const empresaID = String(params.empresaID) || params.empresaID;

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!empresaID) {
      setError("ID da empresa não informado na URL.");
      setIsLoading(false);
      return;
    }

    async function fetchAvisos() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/avisos?empresaId=${empresaID}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Erro ao carregar avisos.");
        } else {
          setAvisos(data);
        }
      } catch (e) {
        setError("Erro ao carregar avisos.");
      }
      setIsLoading(false);
    }

    fetchAvisos();
  }, [empresaID]);

  if (isLoading) return <div className="p-4 text-center">Carregando avisos...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Avisos da Empresa</h1>
      {avisos.length === 0 ? (
        <p className="text-center text-gray-600">Nenhum aviso encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {avisos.map((aviso) => (
            <li key={aviso.id} className="p-4 border border-gray-200 rounded-md shadow-sm">
              <h2 className="font-semibold text-lg mb-1">{aviso.titulo}</h2>
              <p className="text-gray-700 mb-2">{aviso.conteudo}</p>
              <p className="text-sm text-gray-500">
                Criado por: {aviso.user.name} | Data: {new Date(aviso.criadoEm).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
