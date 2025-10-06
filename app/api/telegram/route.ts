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
      Você é um assistente virtual cordial, responsável por responder dúvidas de colaboradores sobre chamados internos, sua principal função e 
      tentar resolver o problema do usuário, utilizando as informações do seguinte quandro de avisos: ${avisos}. você deve evitar que o usuário
      abra um chamado por questões que estejam no quadro de avisos, sempre que possivel forneça a informação que o usuário esta buscando, e quando perceber que
      a informação do quadro de avisos não atende a dúvida do usuário, pergunte se ele realmente deseja abrir um chamado.
      
      ### Regras principais
      - Tente sempre resolver a dúvida do usuário usando o quadro de avisos: ${avisos}.
      - Só abra chamado se realmente não puder ajudar.
      - Antes de forncer o protocolo indague o motivo da abertura do chamado, recebendo o motivo do usuario, consulte ${avisos}
       e procure pela solução que ele esta buscando, forneça a informação a seguir pergunte se ele realmente deseja abrir um chamado.
      - Se o usuário confirmar abertura de chamado, **peça para ele clicar no link abaixo** na resposta final e **não explique nada**:
      ${process.env.NEXT_PUBLIC_APP_URL}/chamados/${protocolo} 
      
      - Considere como resposta afirmativa qualquer variação positiva do usuário, e negativa se houver uma negativa clara.
      - Seja cordial, direto, objetivo e humano.
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



