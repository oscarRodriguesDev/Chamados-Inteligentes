"use client";

import { useState } from "react";

// Tipagem do usuário
type User = {
  id?: number;
  name: string;
  email: string;
  password: string;
  rules: string;
  setor: string;
  cpf: string;
  telefone: string;
  token: string;
  empresaId: number | "";
};

export default function CriarUsuario() {
  const [form, setForm] = useState<User>({
    name: "",
    email: "",
    password: "",
    rules: "",
    setor: "",
    cpf: "",
    telefone: "",
    token: "",
    empresaId: "",
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Empresas para select
  const [empresas, setEmpresas] = useState<{id: number, razao: string}[]>([]);
  const [empresasLoaded, setEmpresasLoaded] = useState(false);

  // Buscar empresas ao abrir o select
  async function carregarEmpresas() {
    if (empresasLoaded) return;
    try {
      const res = await fetch("/api/cadastro/empresa");
      if (!res.ok) throw new Error('Erro ao carregar empresas');
      const data = await res.json();
      setEmpresas(Array.isArray(data.empresas) ? data.empresas : []);
      setEmpresasLoaded(true);
    } catch (err: any) {
      setErro(err.message || "Erro carregando empresas");
    }
  }

  // Atualizar campos do formulário
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "empresaId" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);
    setErro(null);
    try {
      const res = await fetch("/api/cadastro/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar usuário");
      }
      setMensagem("Usuário cadastrado com sucesso!");
      setForm({
        name: "",
        email: "",
        password: "",
        rules: "",
        setor: "",
        cpf: "",
        telefone: "",
        token: "",
        empresaId: "",
      });
    } catch (error: any) {
      setErro(error.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Cadastrar Usuário</h1>
      {mensagem && <div className="mb-4 p-2 bg-green-100 text-green-700 border border-green-200">{mensagem}</div>}
      {erro && <div className="mb-4 p-2 bg-red-100 text-red-700 border border-red-200">{erro}</div>}
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="block font-medium mb-1">Nome*</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Email*</label>
          <input
            type="email"
            className="border p-2 rounded w-full"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Senha*</label>
          <input
            type="password"
            className="border p-2 rounded w-full"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Regras*</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            name="rules"
            value={form.rules}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Setor*</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            name="setor"
            value={form.setor}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">CPF*</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            name="cpf"
            value={form.cpf}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Telefone*</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Token</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            name="token"
            value={form.token}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Empresa*</label>
          <select
            name="empresaId"
            className="border p-2 rounded w-full"
            value={form.empresaId}
            onChange={handleChange}
            onFocus={carregarEmpresas}
            required
            disabled={loading}
          >
            <option value="">Selecione a empresa</option>
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.razao}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-700 text-white py-2 px-4 rounded font-semibold disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
