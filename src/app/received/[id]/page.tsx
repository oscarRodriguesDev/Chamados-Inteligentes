"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Bell, CheckCircle } from "lucide-react"

type Chamado = {
  id: number
  setor: string
  descricao: string
  nome: string
  cpf: string
  telefone: string
  fotos?: string[]
  passos: { id: number; texto: string; concluido: boolean }[]
  status: "aberto" | "em andamento" | "finalizado"
}

// 5 chamados mock
const chamadosMock: Chamado[] = [
  {
    id: 1,
    setor: "RH",
    descricao: "Erro no cálculo das férias",
    nome: "Maria Silva",
    cpf: "123.456.789-00",
    telefone: "(11) 98765-4321",
    fotos: [],
    passos: [
      { id: 1, texto: "Receber chamado", concluido: true },
      { id: 2, texto: "Analisar situação", concluido: false },
      { id: 3, texto: "Entrar em contato com colaborador", concluido: false },
      { id: 4, texto: "Resolver e registrar solução", concluido: false },
    ],
    status: "aberto",
  },
  {
    id: 2,
    setor: "Financeiro",
    descricao: "Pagamento não caiu na conta",
    nome: "João Pereira",
    cpf: "987.654.321-00",
    telefone: "(21) 91234-5678",
    fotos: [],
    passos: [
      { id: 1, texto: "Receber chamado", concluido: true },
      { id: 2, texto: "Validar folha de pagamento", concluido: false },
      { id: 3, texto: "Ajustar pagamento", concluido: false },
      { id: 4, texto: "Confirmar recebimento com colaborador", concluido: false },
    ],
    status: "aberto",
  },
  {
    id: 3,
    setor: "TI",
    descricao: "Não consigo acessar o sistema interno",
    nome: "Ana Souza",
    cpf: "111.222.333-44",
    telefone: "(31) 99876-1234",
    fotos: [],
    passos: [
      { id: 1, texto: "Receber chamado", concluido: true },
      { id: 2, texto: "Verificar credenciais", concluido: false },
      { id: 3, texto: "Restaurar acesso", concluido: false },
      { id: 4, texto: "Confirmar solução com colaborador", concluido: false },
    ],
    status: "em andamento",
  },
  {
    id: 4,
    setor: "Infraestrutura",
    descricao: "Ar-condicionado da sala de reuniões não funciona",
    nome: "Carlos Lima",
    cpf: "222.333.444-55",
    telefone: "(41) 97777-8888",
    fotos: [],
    passos: [
      { id: 1, texto: "Receber chamado", concluido: true },
      { id: 2, texto: "Abrir ordem de serviço", concluido: true },
      { id: 3, texto: "Enviar técnico", concluido: false },
      { id: 4, texto: "Confirmar reparo", concluido: false },
    ],
    status: "em andamento",
  },
  {
    id: 5,
    setor: "Outros",
    descricao: "Solicitação de material de escritório",
    nome: "Fernanda Costa",
    cpf: "333.444.555-66",
    telefone: "(51) 96666-7777",
    fotos: [],
    passos: [
      { id: 1, texto: "Receber chamado", concluido: true },
      { id: 2, texto: "Separar material", concluido: true },
      { id: 3, texto: "Entregar material", concluido: true },
      { id: 4, texto: "Finalizar chamado", concluido: true },
    ],
    status: "finalizado",
  },
]

export default function PainelChamados() {
  const [chamados, setChamados] = useState<Chamado[]>(chamadosMock)
  const [chamadoAtivo, setChamadoAtivo] = useState<Chamado | null>(null)

  const togglePasso = (chamadoId: number, passoId: number) => {
    setChamados((prev) => {
      const novosChamados = prev.map((c) => {
        if (c.id === chamadoId) {
          const novosPassos = c.passos.map((p) =>
            p.id === passoId ? { ...p, concluido: !p.concluido } : p
          )

          // define status
          let novoStatus: Chamado["status"] = "aberto"
          if (novosPassos.every((p) => p.concluido)) {
            novoStatus = "finalizado"
          } else if (novosPassos.some((p) => p.concluido)) {
            novoStatus = "em andamento"
          }

          const atualizado = { ...c, passos: novosPassos, status: novoStatus }

          // se for o chamado ativo, atualiza também
          if (chamadoAtivo?.id === chamadoId) {
            setChamadoAtivo(atualizado)
          }

          return atualizado
        }
        return c
      })
      return novosChamados
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r shadow-md hidden md:flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-lg">Notificações</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chamados.map((c) => (
            <div
              key={c.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                chamadoAtivo?.id === c.id ? "bg-blue-50" : ""
              }`}
              onClick={() => setChamadoAtivo(c)}
            >
              <p className="text-sm text-gray-600">{c.setor}</p>
              <p className="font-medium">{c.descricao}</p>
              <Badge
                variant={
                  c.status === "finalizado"
                    ? "default"
                    : c.status === "em andamento"
                    ? "secondary"
                    : "outline"
                }
                className="mt-1"
              >
                {c.status}
              </Badge>
            </div>
          ))}
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6">
        {!chamadoAtivo ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Selecione um chamado para visualizar
          </div>
        ) : (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Chamado #{chamadoAtivo.id}</CardTitle>
              <p className="text-sm text-gray-500">
                {chamadoAtivo.setor} • {chamadoAtivo.status}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Descrição:</strong> {chamadoAtivo.descricao}
              </p>
              <p>
                <strong>Colaborador:</strong> {chamadoAtivo.nome} (
                {chamadoAtivo.cpf}) - {chamadoAtivo.telefone}
              </p>

              {/* Passos */}
              <div>
                <h3 className="font-semibold mb-2">Passos</h3>
                <div className="space-y-2">
                  {chamadoAtivo.passos.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                    >
                      <Checkbox
                        checked={p.concluido}
                        onCheckedChange={() =>
                          togglePasso(chamadoAtivo.id, p.id)
                        }
                      />
                      <span
                        className={
                          p.concluido
                            ? "line-through text-gray-500"
                            : "text-gray-800"
                        }
                      >
                        {p.texto}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {chamadoAtivo.status === "finalizado" && (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Chamado finalizado!
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
