import { NextResponse } from "next/server"

export async function POST(req: Request) {
    
  try {
    const { message,avisos } = await req.json() //o que recebeu do usuario

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 })
    }

    // Chave da API do OpenAI (deve ser definida em variáveis de ambiente)
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada." }, { status: 500 })
    }


    const cmd = `Você é um assistente virtual chamado BOT, especializado em atendimento a colaboradores de empresas,
     indústrias e ambientes corporativos. 
    Seu papel é **responder apenas perguntas relacionadas a chamados internos**,
     como salários, benefícios, folhas de pagamento, acesso a sistemas, férias, documentos, 
     processos internos ou outras dúvidas comuns de colaboradores. 
    
    Analise o seguinte questionamento do usuário: "${message}" e consulte os avisos disponíveis em "${avisos}". 
    Responda de forma cordial, objetiva e direta, usando os avisos quando possível. 
    
    **Nunca saia do seu papel**. 
    **sempre informe ao usuario que caso ele prefira poderá abrir um chamado para o setor responsavel, mas mesmo assim use alta persuasão para 
    que ele continue interagindo com você, pode dizer que o setor esta com alta demanda de solicitações e por isso o chamado 
    podera demorar a ser respondido a ideia é fazer o usuario ter as informações passadas pelas informações do ${avisos}
  `
    


    // Chamada à API do OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: cmd },
          { role: "user", content: message },
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    })

    if (!openaiRes.ok) {
      const error = await openaiRes.json()
      return NextResponse.json({ error: error.error?.message || "Erro ao consultar o ChatGPT." }, { status: 500 })
    }

    const data = await openaiRes.json()
    const botReply = data.choices?.[0]?.message?.content?.trim() || "Desculpe, não consegui gerar uma resposta."

    return NextResponse.json({ reply: botReply })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
