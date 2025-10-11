"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/src/components/ui/card"
import { CheckCircle } from "lucide-react"

interface Step {
  id: number
  title: string
  completed: boolean
  canUserComplete?: boolean
}

interface Chamado {
  id: number
  setor: string
  descricao: string
  responsavel: string
  prazo: string
  status: "em andamento" | "aguardando avaliacao" | "finalizado"
  steps: Step[]
  // Removido: comentarios, anexos
  avaliacao?: {
    atendimento: number
    bot: number
    sistema: number
    enviada: boolean
  }
}

function getChamadoStatusColor(status: Chamado["status"]) {
  if (status === "finalizado") return "bg-green-200 border-green-500"
  if (status === "em andamento") return "bg-yellow-200 border-yellow-500"
  return "bg-red-200 border-red-500"
}

function getChamadoStatusLabel(status: Chamado["status"]) {
  if (status === "finalizado") return "Finalizado"
  if (status === "em andamento") return "Em execução"
  return "Não atendido"
}

export default function ChamadosAcompanhamento() {
  const [chamados, setChamados] = useState<Chamado[]>([
    // Mock de 5 chamados
    {
      id: 1,
      setor: "TI",
      descricao: "Problema com acesso ao sistema interno",
      responsavel: "João Silva",
      prazo: "28/09/2025",
      status: "aguardando avaliacao",
      steps: [
        { id: 1, title: "Recebimento do chamado", completed: true },
        { id: 2, title: "Análise inicial", completed: true },
        { id: 3, title: "Execução", completed: true },
        { id: 4, title: "Revisão", completed: true },
        { id: 5, title: "Finalização", completed: false, canUserComplete: true },
      ],
      // comentarios: [],
      // anexos: [],
      avaliacao: { atendimento: 0, bot: 0, sistema: 0, enviada: false },
    },
    {
      id: 2,
      setor: "Financeiro",
      descricao: "Erro na emissão de notas fiscais",
      responsavel: "Maria Souza",
      prazo: "30/09/2025",
      status: "em andamento",
      steps: [
        { id: 1, title: "Recebimento do chamado", completed: true },
        { id: 2, title: "Análise inicial", completed: true },
        { id: 3, title: "Execução", completed: false },
        { id: 4, title: "Revisão", completed: false },
        { id: 5, title: "Finalização", completed: false, canUserComplete: true },
      ],
      // comentarios: [],
      // anexos: [],
      avaliacao: { atendimento: 0, bot: 0, sistema: 0, enviada: false },
    },
    {
      id: 3,
      setor: "RH",
      descricao: "Solicitação de férias não processada",
      responsavel: "Carlos Lima",
      prazo: "02/10/2025",
      status: "em andamento",
      steps: [
        { id: 1, title: "Recebimento do chamado", completed: true },
        { id: 2, title: "Análise inicial", completed: false },
        { id: 3, title: "Execução", completed: false },
        { id: 4, title: "Revisão", completed: false },
        { id: 5, title: "Finalização", completed: false, canUserComplete: true },
      ],
      // comentarios: [],
      // anexos: [],
      avaliacao: { atendimento: 0, bot: 0, sistema: 0, enviada: false },
    },
    {
      id: 4,
      setor: "TI",
      descricao: "Solicitação de instalação de software",
      responsavel: "Ana Pereira",
      prazo: "25/09/2025",
      status: "aguardando avaliacao",
      steps: [
        { id: 1, title: "Recebimento do chamado", completed: true },
        { id: 2, title: "Análise inicial", completed: true },
        { id: 3, title: "Execução", completed: true },
        { id: 4, title: "Revisão", completed: true },
        { id: 5, title: "Finalização", completed: false, canUserComplete: true },
      ],
      // comentarios: [],
      // anexos: [],
      avaliacao: { atendimento: 0, bot: 0, sistema: 0, enviada: false },
    },
    {
      id: 5,
      setor: "Logística",
      descricao: "Atraso na entrega de materiais",
      responsavel: "Roberto Costa",
      prazo: "29/09/2025",
      status: "em andamento",
      steps: [
        { id: 1, title: "Recebimento do chamado", completed: true },
        { id: 2, title: "Análise inicial", completed: true },
        { id: 3, title: "Execução", completed: false },
        { id: 4, title: "Revisão", completed: false },
        { id: 5, title: "Finalização", completed: false, canUserComplete: true },
      ],
      // comentarios: [],
      // anexos: [],
      avaliacao: { atendimento: 0, bot: 0, sistema: 0, enviada: false },
    },
  ])

  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Só permite marcar como concluído se for o passo final, permitido ao usuário, e o chamado estiver aguardando avaliação
  const toggleStep = (chamadoId: number, stepId: number) => {
    setChamados((prev) =>
      prev.map((c) => {
        if (c.id !== chamadoId) return c
        const newSteps = c.steps.map((s) => {
          if (
            s.id === stepId &&
            s.canUserComplete &&
            !s.completed &&
            c.status === "aguardando avaliacao"
          ) {
            return { ...s, completed: true }
          }
          return s
        })
        const newStatus = newSteps.find((s) => s.canUserComplete && !s.completed)
          ? c.status
          : "finalizado"
        return { ...c, steps: newSteps, status: newStatus }
      })
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">📌 Chamados em Execução</h1>

      {chamados.map((chamado) => {
        const isExpanded = expandedId === chamado.id
        const statusColor = getChamadoStatusColor(chamado.status)
        const statusLabel = getChamadoStatusLabel(chamado.status)

        return (
          <Card
            key={chamado.id}
            className={`mb-4 transition-all duration-200 cursor-pointer border-2 ${!isExpanded ? statusColor : "border-blue-400"} ${isExpanded ? "" : "hover:opacity-90"}`}
            onClick={() => setExpandedId(isExpanded ? null : chamado.id)}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") setExpandedId(isExpanded ? null : chamado.id)
            }}
            aria-expanded={isExpanded}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span>
                  {chamado.setor} - {chamado.descricao}
                </span>
                <span className="text-xs font-normal text-gray-500 ml-2">
                  {chamado.prazo}
                </span>
              </CardTitle>
              {!isExpanded && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${statusColor} border`}
                >
                  {statusLabel}
                </span>
              )}
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-3">
                {/* Status detalhado */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${statusColor} border`}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-xs text-gray-500">
                    Responsável: {chamado.responsavel}
                  </span>
                </div>

                {/* Passos */}
                <div className="space-y-2">
                  {chamado.steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between bg-white p-2 rounded-xl shadow"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-5 h-5 ${
                            step.completed ? "text-green-500" : "text-gray-300"
                          }`}
                          onClick={e => {
                            e.stopPropagation()
                            toggleStep(chamado.id, step.id)
                          }}
                          style={{
                            cursor:
                              step.canUserComplete &&
                              !step.completed &&
                              chamado.status === "aguardando avaliacao"
                                ? "pointer"
                                : "not-allowed",
                          }}
                        />
                        <span className={step.completed ? "line-through text-gray-500" : ""}>
                          {step.title}
                        </span>
                      </div>
                      {step.canUserComplete &&
                        !step.completed &&
                        chamado.status === "aguardando avaliacao" && (
                          <button
                            type="button"
                            className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                            onClick={e => {
                              e.stopPropagation()
                              toggleStep(chamado.id, step.id)
                            }}
                          >
                            Marcar como concluído
                          </button>
                        )}
                      {step.canUserComplete && step.completed && (
                        <span className="text-green-600 font-semibold">Concluído</span>
                      )}
                    </div>
                  ))}
                </div>
                {/* Não há comentários nem anexos nesta tela */}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
