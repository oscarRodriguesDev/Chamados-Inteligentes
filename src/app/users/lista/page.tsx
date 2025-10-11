"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  rules: string;
  setor: string;
  cpf: string;
  telefone: string;
  token: string;
  empresaID: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsuarios() {
      setLoading(true);
      setErro(null);
      try {
        const res = await fetch("/api/cadastro/users");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao buscar usuários");
        }
        const data = await res.json();
        setUsuarios(Array.isArray(data.users) ? data.users : []);
      } catch (err: any) {
        setErro(err.message || "Erro ao buscar usuários.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsuarios();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja deletar este usuário?")) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`/api/cadastro/users?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao deletar usuário");
      }
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (err: any) {
      setErro(err.message || "Erro ao deletar usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista de Usuários</h1>
        <Link
          href="/users"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
        >
          Novo Usuário
        </Link>
      </div>

      {erro && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {erro}
        </div>
      )}

      {loading ? (
        <div>Carregando usuários...</div>
      ) : usuarios.length === 0 ? (
        <div>Nenhum usuário cadastrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 border">ID</th>
                <th className="py-2 px-3 border">Nome</th>
                <th className="py-2 px-3 border">Email</th>
                <th className="py-2 px-3 border">Setor</th>
                <th className="py-2 px-3 border">Regra</th>
                <th className="py-2 px-3 border">Empresa</th>
                <th className="py-2 px-3 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="py-2 px-3 border">{usuario.id}</td>
                  <td className="py-2 px-3 border">{usuario.name}</td>
                  <td className="py-2 px-3 border">{usuario.email}</td>
                  <td className="py-2 px-3 border">{usuario.setor}</td>
                  <td className="py-2 px-3 border">{usuario.rules}</td>
                  <td className="py-2 px-3 border">{usuario.empresaID}</td>
                  <td className="py-2 px-3 border flex gap-2">
                    <Link
                      href={`/users/editar/${usuario.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(usuario.id)}
                      disabled={loading}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
