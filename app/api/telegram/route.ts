import { NextRequest } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Função para gerar resposta do GPT
async function generateReply(userMessage: string): Promise<string> {
  try {
    const prompt = [
      {
        role: "system",
        content: `Você é um assistente virtual cordial, que responde dúvidas de colaboradores sobre chamados internos. 
        Seja objetivo, claro e útil.`
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



