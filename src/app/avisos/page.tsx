"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";

export default function CriarAvisoPage() {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [setor, setSetor] = useState("OPERACAO"); // valor padrão
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const session = useSession();
  const userID = session.data?.user?.id;
  const empresaID = session.data?.user?.empresaID;

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!userID || !empresaID) {
      setError("Não foi possível identificar o usuário ou empresa.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/avisos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          conteudo,
          userId: Number(userID),       // garante que seja number
          empresaId: Number(empresaID), // garante que seja number
          setor,                        // campo obrigatório
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar aviso.");
        setSuccess(null);
      } else {
        setTitulo("");
        setConteudo("");
        setSetor("OPERACAO"); // reseta para padrão
        setError(null);
        setSuccess("Aviso criado com sucesso!");
      }
    } catch (e: any) {
      setError("Erro ao criar aviso.");
      setSuccess(null);
    }

    setIsLoading(false);
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Criar Aviso</h1>
      <form onSubmit={handleCriar} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título:
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Digite o título do aviso"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo:
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Escreva o conteúdo do aviso"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Setor:
            <select
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            >
              <option value="RH">RH</option>
              <option value="DP">DP</option>
              <option value="TI">TI</option>
              <option value="SESMT">SESMT</option>
              <option value="FINANCEIRO">FINANCEIRO</option>
              <option value="COMERCIAL">COMERCIAL</option>
              <option value="OPERACAO">OPERACAO</option>
              <option value="LOGISTICA">LOGISTICA</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md transition-colors font-semibold text-white ${
            isLoading
              ? "bg-blue-300"
              : "bg-blue-600 hover:bg-blue-700 focus:bg-blue-700"
          }`}
        >
          {isLoading ? "Salvando..." : "Criar"}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600 bg-red-100 border border-red-200 px-4 py-2 rounded-md text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 text-green-700 bg-green-100 border border-green-200 px-4 py-2 rounded-md text-center">
          {success}
        </div>
      )}
    </div>
  );
}
