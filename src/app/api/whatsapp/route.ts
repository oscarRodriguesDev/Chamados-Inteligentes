import { NextRequest, NextResponse } from "next/server";
import { quadro_avisos } from "@/src/app/utils/avisos";
import { isValidCPF } from "@/src/app/utils/validar_cpf";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
var lista_cpf = ['123456','06230124645']

// Controle simples de sessões na memória
interface SessionData {
  step: "inicio" | "cpf_pendente" | "ok";
  cpfTries: number;
}

const userSessions = new Map<string, SessionData>();

// Função para gerar resposta do GPT
async function generateReply(userMessage: string): Promise<string> {
  const avisos = quadro_avisos;
  const now = new Date();
  const protocolo = `tk-${now.getDate().toString().padStart(2, "0")}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getFullYear()}${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}${now
          .getSeconds()
          .toString()
          .padStart(2, "0")}${now.getMilliseconds().toString().padStart(3, "0")}`;

  // Prompt do sistema
  const systemPrompt = `
      Você é um assistente virtual cordial chamada Hevelyn, responsável por responder dúvidas de colaboradores sobre chamados internos.
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
      - O link deve sempre ser exibido em formato completo (http://...), pois o atendimento ocorre via whatsapp.
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
      { role: "system", content: systemPrompt },
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
    return data.choices?.[0]?.message?.content?.trim() || "Desculpe, não consegui entender.";
  } catch (err) {
    console.error("Erro ao gerar resposta do GPT:", err);
    return "Tivemos um erro ao processar sua mensagem. Tente novamente mais tarde.";
  }
}

// Função simples para validar CPF (apenas números e 11 dígitos)


export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();
    console.log("Mensagem recebida:", message, "de:", sessionId);

    const session = userSessions.get(sessionId) || { step: "inicio", cpfTries: 0 };

    // 🔹 Passo 1: primeira interação → apresentação
    if (session.step === "inicio") {
      session.step = "cpf_pendente";
      userSessions.set(sessionId, session);
      return NextResponse.json({
        response: `
🌸 Oi! Eu sou a *Hevelyn*, sua assistente virtual NoLevel.
Posso te ajudar com informações ou abrir um chamado se for necessário.

Para começar, por favor, digite seu *CPF* (apenas números).
Isso é necessário para sua identificação e para que eu possa te ajudar melhor.`
      });
    }

    // 🔹 Passo 2: esperando CPF
    if (session.step === "cpf_pendente") {
      let cpfValido = false;
      try {
        cpfValido = isValidCPF(message, lista_cpf);
      } catch (err: any) {
        // Tratamento do erro lançado pela função de validação de CPF
        session.cpfTries += 1;
        if (session.cpfTries >= 3) {
          userSessions.delete(sessionId);
          return NextResponse.json({
            response: `⚠️ Você não informou um CPF válido após 3 tentativas. O atendimento foi finalizado.`
          });
        } else {
          userSessions.set(sessionId, session);
          return NextResponse.json({
            response: `⚠️ ${err.message || "CPF inválido."} Por favor, digite apenas os 11 números do seu CPF. Tentativa ${session.cpfTries}/3.`
          });
        }
      }

      if (cpfValido) {
        session.step = "ok";
        userSessions.set(sessionId, session);
        return NextResponse.json({
          response: `✅ Obrigado! CPF recebido com sucesso. Agora posso te ajudar com sua solicitação.`
        });
      } else {
        session.cpfTries += 1;
        if (session.cpfTries >= 3) {
          userSessions.delete(sessionId);
          return NextResponse.json({
            response: `⚠️ Você não informou um CPF válido após 3 tentativas. O atendimento foi finalizado.`
          });
        } else {
          userSessions.set(sessionId, session);
          return NextResponse.json({
            response: `⚠️ CPF inválido. Por favor, digite apenas os 11 números do seu CPF. Tentativa ${session.cpfTries}/3.`
          });
        }
      }
    }
       
    // 🔹 Passo 3: CPF recebido → usa GPT normalmente
    if (session.step === "ok") {
      const resposta = await generateReply(message);
      return NextResponse.json({ response: resposta });
    }

    // fallback
    return NextResponse.json({ response: "Erro inesperado. Tente novamente." });

  } catch (error) {
    console.error("Erro ao gerar resposta via GPT:", error);
    return NextResponse.json(
      { response: "Erro interno. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
