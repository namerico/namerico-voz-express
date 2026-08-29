import { GoogleGenAI, Modality } from "@google/genai";

export function getApiKey(): string {
  const localKey = typeof window !== "undefined" ? localStorage.getItem("GEMINI_API_KEY") : null;
  return localKey || (process.env.GEMINI_API_KEY as string) || "";
}

export function setApiKey(key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("GEMINI_API_KEY", key.trim());
  }
}

function getAiClient(): GoogleGenAI {
  const key = getApiKey();
  if (!key) {
    throw new Error("Chave da API Gemini não encontrada. Por favor, configure sua chave gratuita do Google AI Studio no botão 'Chave Gemini' no topo da página.");
  }
  return new GoogleGenAI({ apiKey: key });
}

export interface SpeechOptions {
  language: string;
  emotion?: string;
  accent?: string;
  voiceName?: string;
  voiceStyleModifier?: string;
  vinhetaStyle?: string;
  intensity?: "normal" | "alta" | "extrema";
}

export async function convertTextToSpeech(
  text: string,
  options: SpeechOptions
) {
  const { language, emotion, accent, voiceName = "Fenrir", voiceStyleModifier, intensity = "alta" } = options;
  const ai = getAiClient();
  
  let directorInstructions = "Você é um locutor profissional brasileiro especializado em vinhetas de carro de som, propaganda volante de rua e rádio varejo.";
  
  if (voiceStyleModifier) {
    directorInstructions += ` ${voiceStyleModifier}`;
  }

  if (intensity === "extrema") {
    directorInstructions += " Projete sua voz com intensidade máxima, muita energia, ritmo pulsante de locução de impacto e entusiasmo contagiante.";
  } else if (intensity === "alta") {
    directorInstructions += " Use impostação de voz firme, clara, vibrante, com cadência profissional de locutor comercial de varejo.";
  }

  const toneMap: Record<string, string> = {
    urgencia: "tom de extrema urgência, liquidação relâmpago, chamando a atenção imediata da freguesia e das donas de casa",
    varejo: "estilo locutor clássico de rádio varejo e supermercado, voz forte, potente, empolgante e vendedora",
    carro_rua: "estilo clássico de carro de som volante de bairro brasileiro (carro do ovo, pamonha, pão), carismático, popular e amigável",
    festa_evento: "estilo chamada de show, rodeio, circo, parque e grande festa, voz super animada, empolgante e comemorativa",
    impacto: "estilo locução épica e cinematográfica de grande impacto, voz encorpada, marcante e dramática",
    comunicado: "estilo comunicado oficial e utilidade pública, voz séria, respeitosa, audível e bem articulada",
    oferta_popular: "estilo propaganda de feira e comércio popular, tom persuasivo, entusiasmado com preços baixos",
    alegre: "tom alegre, festivo, dinâmico e cativante",
    brava: "tom enérgico, direto, firme e impositivo",
    calma: "tom institucional aveludado, suave e elegante",
    confiante: "tom extremamente seguro, persuasivo e profissional",
    triste: "tom reflexivo, emotivo e solene",
    assustado: "tom dramático e surpreso",
    enjoado: "tom irônico e expressivo",
    "com fome": "tom de dar água na boca, apetitoso e tentador"
  };

  const selectedTone = emotion ? toneMap[emotion] || `tom ${emotion}` : "locução comercial vibrante";

  let regionalPrompt = "";
  if (accent && language.toLowerCase().includes("português")) {
    regionalPrompt = `com sotaque regional ${accent} do Brasil, usando cadência natural e autêntica da região`;
  }

  let prompt = `[DIREÇÃO DE VOZ]: ${directorInstructions} Interprete o texto em ${language} com ${selectedTone} ${regionalPrompt ? `e ${regionalPrompt}` : ""}. Articule cada palavra com precisão para alto-falantes e caixas de som de rua.\n\nTexto para falar exatamente como escrito:\n"${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Error in TTS conversion:", error);
    throw error;
  }
}

export async function generateVinhetaScript(theme: string, niche: string): Promise<string> {
  const ai = getAiClient();
  try {
    const prompt = `Você é o melhor redator publicitário de vinhetas para carro de som, propaganda volante e rádio varejo do Brasil.
Escreva um roteiro curto, impactante e direto (entre 2 a 4 frases) para ser lido por um locutor em um carro de som.
Nicho/Tema: "${theme || niche}".
Inclua frases de chamada de impacto clássicas de carro de som (como "Atenção dona de casa!", "É só hoje!", "Preço baixo de verdade!", "Corra e aproveite!").
Retorne APENAS o texto puro pronto para a locução, sem explicações nem aspas.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text ? response.text.trim() : "";
  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
}

export async function transcribeAudio(audioBase64: string, mimeType: string = "audio/wav") {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Transcrição fiel do áudio fornecido. Retorne apenas o texto transcrito sem comentários adicionais." },
            {
              inlineData: {
                data: audioBase64,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Error in transcription:", error);
    throw error;
  }
}
