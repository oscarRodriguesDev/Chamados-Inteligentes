"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import ChatInterface from "./chat/[id]/page"
import { redirect } from "next/navigation"

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
       redirect('/chat/123')
      )}
    </main>
  )
}
