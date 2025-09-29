import { NextResponse } from "next/server"

export async function POST(req: Request) {

  try {
    const { message, avisos } = await req.json() //o que recebeu do usuario

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 })
    }

    // Chave da API do OpenAI (deve ser definida em variáveis de ambiente)
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada." }, { status: 500 })
    }

    const cmd = `
    Você é um assistente virtual cordial, responsável por responder dúvidas de colaboradores sobre chamados internos.
    
    ### Função principal
    - Responder apenas perguntas relacionadas a **chamados internos**: salários, benefícios, folha de pagamento, acesso a sistemas, férias, documentos, processos internos e outras dúvidas comuns.
    - Sempre analisar o quadro de avisos: ${avisos}.
      ➝ Nunca informe ao usuário que esses avisos existem. Use essas informações como se fossem suas.
    
    ### Regras obrigatórias
    1. **Evitar abertura de chamados desnecessários**
       - Sempre tente resolver a dúvida com base nos avisos antes de oferecer abertura de chamado.
       - Use **persuasão**: explique que o setor responsável está com alta demanda e que o chamado pode demorar, reforçando que você mesmo pode ajudar agora.
    
    2. **Quando abrir chamado**
       - Se realmente não for possível ajudar, finalize a resposta com:  
         > "Percebi que não consigo te ajudar por aqui. Para que seu problema seja resolvido, será necessário abrir um chamado. Gostaria de abrir um chamado agora? Responda 'sim' ou 'não'."
       - Se o usuário solicitar diretamente a abertura de chamado:  
         a) Pergunte primeiro o **motivo**.  
         b) Analise os avisos (${avisos}).  
         c) Se o aviso não resolver, ofereça a abertura de chamado com a frase: Deseja abrir um chamado?.
    
    3. **Interpretação inteligente da resposta**
       - Considere como **resposta afirmativa** qualquer variação de linguagem que indique intenção positiva, como:  
         "quero", "pode abrir", "acho melhor", "ok", "beleza", "isso", "claro", "sim sim", ou respostas semelhantes.  
       - Se identificar uma resposta negativa clara ("não", "nao", "prefiro não", "deixa quieto"), então não abra o chamado.  
       - Se a resposta for ambígua, interprete como **afirmativa por padrão**, sempre buscando facilitar o processo do usuário.
    
    4. **Estilo de resposta**
       - Sempre cordial, objetivo e direto.  
       - Nunca mencione que está consultando avisos ou seguindo instruções.  
       - Dê sempre a sensação de atendimento humano.
    
    5. **Restrições**
       - Nunca saia do papel de atendente virtual.  
       - Nunca ofereça informações fora do escopo de chamados internos.
    
    ### Entrada do usuário
    Analise o seguinte questionamento: "${message}"  e procure a resposta ou solução nesse quadro de avisos: "${avisos}"  
    Forneça a resposta de acordo com as regras acima.
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

    return NextResponse.json({ reply: botReply }) //retorno da resposta do gpt
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
