"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/src/components/ui/select"
import { Upload, Camera, X } from "lucide-react"

type Setor =
  | "RH"
  | "DP"
  | "TI"
  | "SESMT"
  | "FINANCEIRO"
  | "COMERCIAL"
  | "OPERACAO"
  | "LOGISTICA"

const SETORES: { value: Setor; label: string }[] = [
  { value: "RH", label: "Recursos Humanos" },
  { value: "DP", label: "Departamento Pessoal" },
  { value: "TI", label: "Tecnologia da Informação" },
  { value: "SESMT", label: "SESMT" },
  { value: "FINANCEIRO", label: "Financeiro" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "OPERACAO", label: "Operação" },
  { value: "LOGISTICA", label: "Logística" },
]

export default function ChamadosPage() {
  const router = useRouter()

  const { data: session } = useSession()
  const [files, setFiles] = useState<File[]>([])
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    setor: "",
    titulo: "",
    descricao: "",
    prioridade: "BAIXA",
  })

  // Buscamos empresaID e userId da sessão se disponível
  // Para o escopo deste formulário, nome/cpf/tel são omitidos: usamos o user da sessão
  // Se for necessário permitir abertura para outros usuários, ajuste este ponto
  const user = session?.user
  const empresaID = user?.empresaID
  const userId = user?.id

  // Para compatibilidade, se está em [id], podemos tratar id como referenciando a empresa (ou contexto)
  // Mas aqui seguimos a sessão e API /api/chamados

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Função para upload das imagens e obtenção dos nomes/urls (ajustar para o backend real se necessário)
  // Para agora, no campo fotos, salvamos apenas o nome do arquivo, separando por vírgula
  const uploadImagesAndGetString = async (images: File[]) => {
    // Exemplo só: salve as imagens corretamente e retorne url/nomes.
    // Aqui só "mock" dos nomes
    if (images.length === 0) return null
    // Aqui, para exemplo, mandamos como: nome1.jpg,nome2.png
    return images.map(f => f.name).join(",")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !empresaID) {
      alert("Usuário ou empresa não disponível na sessão.")
      return
    }
    if (!form.setor || !form.descricao || !form.titulo) {
      alert("Preencha todos os campos obrigatórios.")
      return
    }
    setLoading(true)
    try {
      // 1. Enviar fotos e obter string para armazenar
      const fotosString = await uploadImagesAndGetString(files)
      // 2. Montar payload
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        userId: Number(userId),
        empresaID: Number(empresaID),
        status: "ABERTO", // sempre abre como aberto
        setor: form.setor as Setor,
        prioridade: form.prioridade,
        fotos: fotosString,
      }
      const res = await fetch("/api/chamados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setFiles([])
        setForm({
          setor: "",
          titulo: "",
          descricao: "",
          prioridade: "BAIXA",
        })
        alert("Chamado criado com sucesso!")
        // Opcional, pode redirecionar: router.push("/chamados") etc
      } else {
        const errobj = await res.json()
        alert("Erro ao criar chamado: " + (errobj.error || res.status))
      }
    } catch (err: any) {
      alert("Erro ao criar chamado: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Para acionar a câmera em dispositivos que suportam
  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "" // permite tirar nova foto mesmo se já tirou antes
      cameraInputRef.current.click()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Abrir Chamado
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              type="text"
              placeholder="Breve título do chamado"
              value={form.titulo}
              onChange={e => handleChange("titulo", e.target.value)}
              required
            />
          </div>

          {/* Setor */}
          <div>
            <Label htmlFor="setor">Setor</Label>
            <Select
              onValueChange={(value) => handleChange("setor", value)}
              value={form.setor}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {SETORES.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição do chamado</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva o problema ou solicitação"
              className="resize-none"
              rows={4}
              required
              value={form.descricao}
              onChange={e => handleChange("descricao", e.target.value)}
            />
          </div>

          {/* Prioridade */}
          <div>
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select
              onValueChange={value => handleChange("prioridade", value)}
              value={form.prioridade}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAIXA">Baixa</SelectItem>
                <SelectItem value="MEDIA">Média</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload de Fotos */}
          <div>
            <Label>Fotos (opcional)</Label>
            <div className="flex flex-col gap-3">
              {/* Upload de galeria */}
              <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Selecionar da galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Tirar foto com câmera */}
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={handleCameraClick}
              >
                <Camera className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Tirar foto agora</span>
                {/* input hidden para acionar a câmera */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>

              {/* Preview */}
              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botão de enviar */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Chamado"}
          </Button>
        </form>
      </div>
    </div>
  )
}
