"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useState } from "react"

// Dados mock
const chamadosPorSetor = [
  { setor: "RH", total: 35 },
  { setor: "Financeiro", total: 50 },
  { setor: "TI", total: 80 },
  { setor: "Infraestrutura", total: 20 },
  { setor: "Outros", total: 15 },
]

const statusChamados = [
  { status: "Aberto", value: 40 },
  { status: "Em andamento", value: 60 },
  { status: "Concluído", value: 100 },
]

const motivosRanking = [
  { motivo: "Erro de sistema", total: 45 },
  { motivo: "Solicitação de acesso", total: 30 },
  { motivo: "Problema de pagamento", total: 25 },
  { motivo: "Infraestrutura", total: 20 },
  { motivo: "Outros", total: 10 },
]

const chamadosSemSolucao = 12
const chamadosAtrasados = 8
const tempoMedioFechamento = 2.7 // dias

const cores = ["#FF6384", "#36A2EB", "#4CAF50", "#FFCE56", "#8E44AD"]

export default function DashboardChamados() {
  const [totalChamados] = useState(200)
  const [chamadosResolvidos] = useState(100)
  const [chamadosPendentes] = useState(100)

  return (
    <div className="min-h-screen bg-gray-100 p-4 lg:p-8">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6">📊 Dashboard de Chamados</h1>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-white shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Total de Chamados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalChamados}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{chamadosResolvidos}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{chamadosPendentes}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Tempo Médio Fechamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{tempoMedioFechamento} <span className="text-base font-normal">dias</span></p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Sem Solução</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{chamadosSemSolucao}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{chamadosAtrasados}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chamados por setor */}
        <Card className="bg-white shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Chamados por Setor</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chamadosPorSetor}>
                <XAxis dataKey="setor" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#36A2EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos chamados */}
        <Card className="bg-white shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Status dos Chamados</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChamados}
                  dataKey="value"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusChamados.map((_, index) => (
                    <Cell key={index} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ranking dos motivos */}
        <Card className="bg-white shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Ranking dos Motivos</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={motivosRanking}
                layout="vertical"
                margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="motivo" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="total" fill="#FF6384" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
