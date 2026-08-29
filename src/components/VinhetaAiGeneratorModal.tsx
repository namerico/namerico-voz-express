import React, { useState } from "react";
import { generateVinhetaScript } from "../lib/gemini";
import { Sparkles, X, Wand2, Loader2, Check, ArrowRight } from "lucide-react";

interface VinhetaAiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript: (script: string) => void;
}

export function VinhetaAiGeneratorModal({
  isOpen,
  onClose,
  onApplyScript,
}: VinhetaAiGeneratorModalProps) {
  const [promptInput, setPromptInput] = useState("");
  const [niche, setNiche] = useState("Varejo e Supermercado");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const suggestions = [
    "Supermercado: Queima de carnes e cerveja gelada no fim de semana",
    "Carro do Ovo: 30 ovos graúdos por 10 reais direto da granja",
    "Pizzaria Delivery: Peça 2 pizzas e ganhe 1 refrigerante 2L",
    "Loja de Roupas: Toda a loja com até 70% de desconto à vista",
    "Barbearia: Corte de cabelo e barba com atendimento sem hora marcada",
    "Lava-Rápido: Lavagem americana completa com cera cristalizada",
    "Inauguração de Drogaria: Remédios genéricos a preço de custo",
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || promptInput;
    if (!textToUse.trim()) {
      setError("Por favor, descreva o produto ou promoção.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await generateVinhetaScript(textToUse, niche);
      setGeneratedScript(result);
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar roteiro. Verifique a chave ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 rounded-xl font-bold">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Gerador de Roteiro de Vinheta com IA
              </h2>
              <p className="text-xs text-slate-400">
                Crie chamadas de impacto de locutor comercial em segundos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Descreva o seu comércio, produto ou oferta:
            </label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ex: Supermercado Central com oferta de picanha a R$ 29,90 e cerveja a R$ 2,50 só hoje..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Quick suggestions */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Ideias Rápidas (Clique para testar):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptInput(s);
                    handleGenerate(s);
                  }}
                  className="text-xs text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800/90 hover:border-amber-500/50 px-2.5 py-1 rounded-xl transition-all text-left"
                >
                  ⚡ {s.split(":")[0]}: <span className="text-slate-400">{s.split(":")[1]?.slice(0, 30)}...</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando Roteiro de Locutor com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Roteiro de Carro de Som
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Result */}
          {generatedScript && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Roteiro de Locução Pronto:
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                "{generatedScript}"
              </p>
              <button
                onClick={() => {
                  onApplyScript(generatedScript);
                  onClose();
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Aplicar no Editor do VozExpress
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
