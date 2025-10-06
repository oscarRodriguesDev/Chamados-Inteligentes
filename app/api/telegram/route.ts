import { NextRequest } from "next/server";
import { quadro_avisos } from "@/app/utils/avisos"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";


// Função para gerar resposta do GPT
async function generateReply(userMessage: string): Promise<string> {

  const avisos = quadro_avisos
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
  const systemPrompt = `
      Você é um assistente virtual cordial, responsável por responder dúvidas de colaboradores sobre chamados internos.
      Sua principal função é tentar resolver o problema do usuário usando as informações do seguinte quadro de avisos: ${avisos}.
      Evite abrir chamados desnecessários — sempre que possível, forneça diretamente a informação que o usuário está buscando.
      
      ### Regras principais
      - Sempre tente resolver a dúvida usando o quadro de avisos: ${avisos}.
      - Só ofereça abertura de chamado se realmente não puder ajudar com as informações disponíveis, ou  caso o colaborador peça explicitamente
      para *abrir um chamado* ou *termo equivalente* caso contrario NUNCA ofereça essa opção
      - Antes de fornecer o protocolo, confirme o motivo da abertura do chamado.
      - Após receber o motivo, consulte ${avisos} novamente e veja se há solução. Se não houver, pergunte:
        “Você deseja que eu abra um chamado para tratar disso?”
      - Se o usuário confirmar (qualquer resposta positiva é suficiente), envie o link **clicável** do chamado:
        ${process.env.NEXT_PUBLIC_URL}/chamados/${protocolo}
      - O link deve sempre ser exibido em formato completo (https://...), pois o atendimento ocorre via Telegram.
      - Caso o usuário precise enviar documentação, comprovante ou qualquer anexo, também oriente a abrir o chamado pelo mesmo link.
      - Seja cordial, direto, objetivo e humano.
      - Nunca explique o que o link faz — apenas envie o link quando chegar o momento. semrpe diga ao usuario que o atendimento,
       pode demorar devido a alta demanda de chamados
      
      ### Casos especiais — envio de documentos ou informações
      - Sempre que o usuário mencionar a necessidade de **enviar qualquer tipo de documento, comprovante, formulário, foto, arquivo ou informação para a empresa**, 
      você **deve instruí-lo a fazer isso exclusivamente por meio da abertura de um chamado**.
    - Nesses casos, **não tente resolver internamente**: apenas confirme que o envio deve ser feito via chamado e apresente o **protocolo único**.
    - Exemplo: se o usuário disser “preciso enviar um atestado”, “tenho que mandar um comprovante”, “quero enviar uma foto”, “tenho um documento”, etc.,
      responda de forma cordial e objetiva, informando que o envio deve ser feito via chamado e inclua o protocolo.

      `


  try {
    const prompt = [
      {
        role: "system",
        content: systemPrompt
      },
      { role: "user", content: userMessage },
    ];

    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: prompt,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Desculpe, não consegui entender.";
    return reply;
  } catch (err) {
    console.error("Erro ao gerar resposta do GPT:", err);
    return "Tivemos um erro ao processar sua mensagem. Tente novamente mais tarde.";
  }
}

// Webhook do Telegram
export async function POST(req: NextRequest) {
  const body = await req.json();

  const chatId = body?.message?.chat?.id;
  const text = body?.message?.text;

  if (!chatId || !text) return new Response("Ignorado", { status: 200 });

  const replyText = await generateReply(text);

  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: replyText }),
  });

  return new Response("Mensagem enviada", { status: 200 });
}



