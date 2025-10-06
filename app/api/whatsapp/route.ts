const EVOLUTION_API_URL = "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY; // defina no .env

export async function sendMessage(numero: string, mensagem: string) {
  const response = await fetch(`${EVOLUTION_API_URL}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${EVOLUTION_API_KEY}`,
    },
    body: JSON.stringify({
      to: numero,
      message: mensagem
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao enviar mensagem: ${response.status} - ${text}`);
  }

  return response.json();
}
