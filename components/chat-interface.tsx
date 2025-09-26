"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, LogOut, Bot, User } from "lucide-react"
import { quadro_avisos } from "@/app/utils/avisos"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatInterfaceProps {
  userName: string
  onLogout: () => void
}

// Corrigido: agora é async e retorna Promise<string>
const getBotResponse = async (userMessage: string): Promise<string> => {
  const message = userMessage.toLowerCase()

  //saudação do bot sem necessidade de ia
  if (message.includes("olá") || message.includes("oi") || message.includes("hello")) {
    return "Olá! É um prazer conversar com você. Como posso ajudá-lo hoje?"
  }

  //tenta responder humanamente
  if (message.includes("como você está") || message.includes("tudo bem")) {
    return "Estou funcionando perfeitamente, obrigado por perguntar! Como posso ajudá-lo?"
  }

  //detecta pedido de ajuda pede o assunto
  if (message.includes("ajuda") || message.includes("help")) {
    return "Claro! Estou aqui para ajudar. Posso fornecer informações sobre diversos assuntos, responder perguntas e orientá-lo. O que você precisa saber?"
  }

  if (message.includes("contato") || message.includes("telefone") || message.includes("email")) {
    return "Você pode entrar em contato conosco pelo email: contato@empresa.com ou telefone: (11) 9999-9999. Nosso horário de atendimento é de segunda a sexta, das 9h às 18h."
  }

  //encerramento
  if (message.includes("obrigado") || message.includes("valeu") || message.includes("thanks")) {
    return "De nada! Fico feliz em poder ajudar. Se tiver mais alguma dúvida, estarei aqui!"
  }

  // Aqui faz requisição para o chat passando o questionamento do usuário e o quadro de avisos
  try {
    const res = await fetch("/api/bot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        avisos: quadro_avisos,
      }),
    })
    if (!res.ok) {
      const errorData = await res.json()
      return errorData.error || "Erro ao obter resposta do assistente."
    }
    const data = await res.json()
    return data.reply || "Desculpe, não consegui gerar uma resposta."
  } catch {
    return "Erro ao conectar com o assistente virtual."
  }
}

export default function ChatInterface({ userName, onLogout }: ChatInterfaceProps) {
  const router = useRouter() // ✅ agora está dentro do componente

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Olá ${userName}! Bem-vindo ao nosso sistema de chamados.
       Sou seu assistente virtual e estou aqui para ajudá-lo. 
       Acredito que tenho todas as informações que você precisa, 
       mas se necessário poderei transferir você para um de nossos atendentes.`,
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showOptions, setShowOptions] = useState(false) // 👈 novo estado
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)
    setShowOptions(false) // 👈 esconde botões ao mandar nova msg

    const botText = await getBotResponse(userMessage.text)
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botText,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
    setIsTyping(false)
    setShowOptions(true) // 👈 mostra botões após resposta do bot
  }

  return (
    <div className="min-h-screen chat-gradient">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">Assistente Virtual</h1>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Olá, {userName}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <Card
                className={`max-w-[70%] p-3 ${
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Card>

              {message.sender === "user" && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-card p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </Card>
            </div>
          )}

          {/* Botões extras */}
          {showOptions && (
            <div className="flex justify-center gap-3 mt-4">
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
              <Button
                variant="default"
                onClick={() => router.push("/chamados/01")}
              >
                Abrir Chamado
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!inputMessage.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
