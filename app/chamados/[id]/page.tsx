"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Upload, X } from "lucide-react"

export default function ChamadosPage() {
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: enviar dados + fotos para API
    alert("Chamado enviado com sucesso!")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Abrir Chamado
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Setor */}
          <div>
            <Label>Setor</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rh">Recursos Humanos</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="ti">Tecnologia da Informação</SelectItem>
                <SelectItem value="infra">Infraestrutura</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div>
            <Label>Descrição do chamado</Label>
            <Textarea
              placeholder="Descreva o problema ou solicitação"
              className="resize-none"
              rows={4}
              required
            />
          </div>

          {/* Nome */}
          <div>
            <Label>Nome</Label>
            <Input type="text" placeholder="Seu nome completo" required />
          </div>

          {/* CPF */}
          <div>
            <Label>CPF</Label>
            <Input type="text" placeholder="000.000.000-00" required />
          </div>

          {/* Telefone */}
          <div>
            <Label>Telefone</Label>
            <Input type="tel" placeholder="(00) 00000-0000" required />
          </div>

          {/* Upload de Fotos */}
          <div>
            <Label>Fotos (opcional)</Label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Adicionar fotos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

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
          <Button type="submit" className="w-full">
            Enviar Chamado
          </Button>
        </form>
      </div>
    </div>
  )
}
