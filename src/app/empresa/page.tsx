"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CadastroEmpresa() {
  const router = useRouter();
  const [form, setForm] = useState({
    razao: "",
    cnpj: "",
    botNumer: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErro(null);
    setSucesso(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setSucesso(null);

    if (!form.razao || !form.cnpj || !form.botNumer) {
      setErro("Por favor, preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/cadastro/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao cadastrar empresa.");
      } else {
        setSucesso("Empresa cadastrada com sucesso!");
        setForm({ razao: "", cnpj: "", botNumer: "" });
        setTimeout(() => {
          router.push("/empresa/lista");
        }, 1500);
      }
    } catch (err: any) {
      setErro("Erro ao conectar com o servidor.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow rounded p-8">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Empresa</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Razão Social *</label>
          <input
            type="text"
            name="razao"
            value={form.razao}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">CNPJ *</label>
          <input
            type="text"
            name="cnpj"
            value={form.cnpj}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Número do Bot *</label>
          <input
            type="text"
            name="botNumer"
            value={form.botNumer}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        {erro && (
          <div className="text-red-600 font-medium">{erro}</div>
        )}
        {sucesso && (
          <div className="text-green-600 font-medium">{sucesso}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Cadastrando..." : "Cadastrar Empresa"}
        </button>
      </form>
    </div>
  );
}
