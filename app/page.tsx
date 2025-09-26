"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import ChatInterface from "@/components/chat-interface"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  const handleLogin = (name: string) => {
    setUserName(name)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName("")
  }

  return (
    <main className="min-h-screen">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <ChatInterface userName={userName} onLogout={handleLogout} />
      )}
    </main>
  )
}
