"use client"

import { signIn } from "next-auth/react"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { MessageCircle, User, Lock } from "lucide-react"



export default function LoginForm() {
  const [username, setUsername] = useState("oscar@nolevel.com.br")
  const [password, setPassword] = useState("123456")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // O backend espera username como "email" no authorize.
      // O signIn chama a rota [...nextauth] internamente.
      const res = await signIn("credentials", {
        email: username.trim(),
        password,
        redirect: false,
      });

      // Erro frequente: res.ok NÃO RETORNA TRUE em erro, mas res.error pode vir como string/JSON
      if (res && res.ok) {
        // Login OK
        router.push("/chat/123")
      } else if (res && res.error) {
        let msg = res.error
        try {
          const tryJson = JSON.parse(res.error)
          if (typeof tryJson === "object" && tryJson.message) {
            msg = tryJson.message
          }
        } catch {}
        // NextAuth error server message (ou padrão)
        if (
          msg ===
          "There is a problem with the server configuration. Check the server logs for more information." ||
          msg ===
          "NEXTAUTH_SECRET must be set"
        ) {
          setError(
            "Problema de configuração do servidor. Contate o administrador."
          )
        } else if (msg === "Callback route is not defined for credentials provider") {
          setError("Erro de configuração do provedor. Falta rota de callback.")
        } else if (msg.includes && msg.includes("ECONNREFUSED")) {
          setError("Backend não disponível.")
        } else {
          setError(msg || "Dados de login inválidos.")
        }
      } else {
        setError("Dados de login inválidos.")
      }
    } catch (err: any) {
      if (
        err?.message ===
        "There is a problem with the server configuration. Check the server logs for more information."
      ) {
        setError(
          "Problema de configuração do servidor. Contate o administrador."
        )
      } else {
        setError(err?.message || "Erro ao realizar o login.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen chat-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-balance">
                Bem-vindo ao ChatBot
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Faça login para conversar com nosso assistente virtual
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Usuário */}
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Usuário ou E-mail"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="username"
                />
              </div>
              {/* Senha */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !username.trim() || !password.trim()}
              >
                {isLoading ? "Entrando..." : "Entrar no Chat"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
