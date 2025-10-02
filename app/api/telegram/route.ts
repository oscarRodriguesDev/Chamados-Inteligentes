import { NextRequest } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const chatId = body?.message?.chat?.id;
  const text = body?.message?.text;

  if (!chatId || !text) return new Response('Ignorado', { status: 200 });

  const replyText = `Você disse: ${text}`;

  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: replyText }),
  });

  return new Response('Mensagem enviada', { status: 200 });
}

