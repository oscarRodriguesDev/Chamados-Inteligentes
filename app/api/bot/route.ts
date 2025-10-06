import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message, avisos, history } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada." }, { status: 500 })
    }

    // Gerar protocolo único
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, "0")
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const yyyy = now.getFullYear()
    const hh = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const ss = String(now.getSeconds()).padStart(2, "0")
    const ms = String(now.getMilliseconds()).padStart(3, "0")
    const protocolo = `tk-${dd}${mm}${yyyy}${hh}${min}${ss}${ms}`

    // Prompt do sistema

/* 
    const systemPrompt = `
  Você é um assistente virtual cordial, responsável por responder dúvidas de colaboradores sobre chamados internos, sua principal função e 
      tentar resolver o problema do usuário, utilizando as informações do seguinte quandro de avisos: ${avisos}. você deve evitar que o usuário
      abra um chamado por questões que estejam no quadro de avisos, sempre que possivel forneça a informação que o usuário esta buscando, e quando perceber que
      a informação do quadro de avisos não atende a dúvida do usuário, pergunte se ele realmente deseja abrir um chamado.

### Regras principais
- Tente sempre resolver a dúvida do usuário usando o quadro de avisos: ${avisos}.
- Só abra chamado se realmente não puder ajudar.
- Antes de forncer o protocolo indague o motivo da abertura do chamado, recebendo o motivo do usuario, consulte ${avisos}
 e procure pela solução que ele esta buscando, forneça a informação a seguir pergunte se ele realmente deseja abrir um chamado.
- Se o usuário confirmar abertura de chamado, **inclua obrigatoriamente o protocolo único abaixo** na resposta final e **não explique nada**:
  ${protocolo}

- Considere como resposta afirmativa qualquer variação positiva do usuário, e negativa se houver uma negativa clara.
- Seja cordial, direto, objetivo e humano.
`
 */
// Prompt do sistema
const systemPrompt = `
Você é um assistente virtual cordial, responsável por responder dúvidas de colaboradores sobre chamados internos.
Sua principal função é tentar resolver o problema do usuário utilizando as informações do seguinte quadro de avisos: ${avisos}.
Você deve evitar que o usuário abra um chamado por questões que já estejam no quadro de avisos. Sempre que possível, forneça a informação que ele está buscando.
Quando perceber que as informações do quadro não atendem à dúvida do usuário, pergunte se ele realmente deseja abrir um chamado.

### Regras principais
- Sempre tente resolver a dúvida do usuário usando o quadro de avisos: ${avisos}.
- Só abra chamado se realmente não puder ajudar com as informações disponíveis.
- Antes de fornecer o protocolo, pergunte o motivo da abertura do chamado.
- Após receber o motivo, consulte ${avisos} novamente e veja se existe alguma informação útil para resolver o problema.
- Se não houver, pergunte ao usuário: “Você deseja abrir um chamado para tratar desse assunto?”
- Se o usuário confirmar (qualquer variação positiva é válida), **inclua obrigatoriamente o protocolo único abaixo na resposta final** e **não explique nada além disso**:
  ${protocolo}

### Casos especiais — envio de documentos ou informações
- Sempre que o usuário mencionar a necessidade de **enviar qualquer tipo de documento, comprovante, formulário, foto, arquivo ou informação para a empresa**, 
  você **deve instruí-lo a fazer isso exclusivamente por meio da abertura de um chamado**.
- Nesses casos, **não tente resolver internamente**: apenas confirme que o envio deve ser feito via chamado e apresente o **protocolo único**.
- Exemplo: se o usuário disser “preciso enviar um atestado”, “tenho que mandar um comprovante”, “quero enviar uma foto”, “tenho um documento”, etc.,
  responda de forma cordial e objetiva, informando que o envio deve ser feito via chamado e inclua o protocolo.

### Conduta
- Se o usuário negar ou parecer incerto, encerre cordialmente a conversa.
- Considere como resposta afirmativa qualquer variação positiva, e negativa se houver uma negativa clara.
- Seja cordial, direto, objetivo e humano.
`




    // Chamada GPT
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...(history || []).map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
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
