import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import AuthProvider from '../context/AuthProvider'


export const metadata: Metadata = {
  title: 'App Chamados',
  description: 'Sistema para acompanhamento e gestão de chamados internos, facilitando o controle, execução e avaliação de solicitações em diferentes setores da empresa.',
 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
     
        
        
        <AuthProvider>
        {children}
       
        </AuthProvider>
    
      </body>
    </html>
  )
}
