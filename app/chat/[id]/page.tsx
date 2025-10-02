"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  isGpt?: boolean
}

export default function ChatInterface() {
  const parms = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const id = parms.id

  const initialMessage: Message[] = [
    {
      id: "1",
      text: `Olá ${id}! Bem-vindo ao nosso sistema de chamados. Sou seu assistente virtual. Por favor, me diga o motivo do seu atendimento.`,
      sender: "bot",
      timestamp: new Date(),
      isGpt: false,
    },
  ]

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("chatHistory")
      if (saved) {
        return JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      }
    }
    return initialMessage
  })
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showChamadoButton, setShowChamadoButton] = useState(false)

  useEffect(() => {
    sessionStorage.setItem("chatHistory", JSON.stringify(messages))
  }, [messages])

  const handleLogout = () => {
    sessionStorage.removeItem("chatHistory")
    setMessages(initialMessage)
    setInputMessage("")
    setIsTyping(false)
    setShowOptions(false)
    setShowChamadoButton(false)
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages])

  const callGptApi = async (userMessage: string, history: Message[]) => {
    try {
      const res = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          avisos: quadro_avisos,
          history: history.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
        }),
      })
      const data = await res.json()
      return { text: data.reply || "Desculpe, não consegui gerar uma resposta.", isGpt: true }
    } catch (e) {
      return { text: "Erro ao conectar com o assistente virtual.", isGpt: true }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)
    setShowOptions(false)
    setShowChamadoButton(false)

    const botResult = await callGptApi(userMessage.text, [...messages, userMessage])
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResult.text,
      sender: "bot",
      timestamp: new Date(),
      isGpt: botResult.isGpt,
    }

    setMessages(prev => [...prev, botMessage])

    // Detecta protocolo TK-...
    const protocoloRegex = /tk-\d{2}\d{2}\d{4}\d{2}\d{2}\d{2}\d{3}/i
    setShowChamadoButton(protocoloRegex.test(botResult.text))

    setIsTyping(false)
    setShowOptions(true)
  }

  return (
    <div className="min-h-screen chat-gradient">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="w-5 h-5" /></AvatarFallback></Avatar>
            <div>
              <h1 className="font-semibold">Assistente Virtual</h1>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Olá, {id}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2"/>Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="max-w-4xl mx-auto p-4 pb-24 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "bot" && <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="w-4 h-4"/></AvatarFallback></Avatar>}
            <Card className={`max-w-[70%] p-3 ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
              <p className={`text-xs mt-2 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </Card>
            {msg.sender === "user" && <Avatar className="w-8 h-8"><AvatarFallback className="bg-secondary text-secondary-foreground"><User className="w-4 h-4"/></AvatarFallback></Avatar>}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="w-4 h-4"/></AvatarFallback></Avatar>
            <Card className="bg-card p-3 flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay:"0.1s"}}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay:"0.2s"}}></div>
            </Card>
          </div>
        )}

        {showOptions && (
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2"/>Sair</Button>
            {showChamadoButton && <Button variant="default" onClick={() => router.push("/chamados/01")}>Abrir Chamado</Button>}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1" disabled={isTyping} />
            <Button type="submit" disabled={!inputMessage.trim() || isTyping}><Send className="w-4 h-4"/></Button>
          </form>
        </div>
      </div>
    </div>
  )
}
