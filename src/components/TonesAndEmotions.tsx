import React, { useState } from "react";
import { EMOTIONS, ACCENTS } from "../data/vinhetaData";
import { Sparkles, MapPin, Tag, HelpCircle, Check } from "lucide-react";

interface TonesAndEmotionsProps {
  selectedEmotion: string | null;
  onSelectEmotion: (emotionId: string | null) => void;
  selectedAccent: string | null;
  onSelectAccent: (accentId: string | null) => void;
  languageId: string;
}

export function TonesAndEmotions({
  selectedEmotion,
  onSelectEmotion,
  selectedAccent,
  onSelectAccent,
  languageId,
}: TonesAndEmotionsProps) {
  const [activeTab, setActiveTab] = useState<"carro_de_som" | "geral">("carro_de_som");

  const carroDeSomTones = EMOTIONS.filter((e) => e.category === "carro_de_som");
  const geralTones = EMOTIONS.filter((e) => e.category === "geral");
  const displayTones = activeTab === "carro_de_som" ? carroDeSomTones : geralTones;

  return (
    <div className="space-y-4">
      {/* Emoções & Tons Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Tom & Emoção da Locução
            </h3>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("carro_de_som")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeTab === "carro_de_som"
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🚨 Especial Carro de Som & Varejo
            </button>
            <button
              onClick={() => setActiveTab("geral")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeTab === "geral"
                  ? "bg-slate-800 text-slate-200 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🎭 Emoções Gerais
            </button>
          </div>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {displayTones.map((item) => {
            const isSelected = selectedEmotion === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectEmotion(isSelected ? null : item.id)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all relative ${
                  isSelected
                    ? "bg-orange-500/15 border-orange-500 text-white shadow-sm ring-1 ring-orange-500/40"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-base">{item.icon}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {item.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Emotion Feedback & Prompt Preview */}
        {selectedEmotion && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-orange-300">
            <span className="flex items-center gap-1.5">
              <span>Tom Ativo:</span>
              <span className="font-semibold bg-orange-950/60 border border-orange-800/40 px-2 py-0.5 rounded-md">
                [{EMOTIONS.find((e) => e.id === selectedEmotion)?.name}]
              </span>
              <span className="text-slate-400 italic text-[11px] hidden sm:inline">
                {EMOTIONS.find((e) => e.id === selectedEmotion)?.example}
              </span>
            </span>
            <button
              onClick={() => onSelectEmotion(null)}
              className="text-[11px] text-slate-400 hover:text-red-400 underline underline-offset-2"
            >
              Remover tom
            </button>
          </div>
        )}
      </div>

      {/* Sotaques Regionais Brasileiros (se Português) */}
      {languageId === "pt-BR" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Sotaque Regional Brasileiro
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Cadência local autêntica</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACCENTS.map((acc) => {
              const isSelected = selectedAccent === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccent(isSelected ? null : acc.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/40"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-slate-200">{acc.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">{acc.region}</div>
                </button>
              );
            })}
          </div>

          {selectedAccent && (
            <div className="mt-2.5 flex items-center justify-between text-xs text-emerald-300">
              <span>
                Sotaque ativo: <strong className="font-semibold">{selectedAccent.toUpperCase()}</strong>
              </span>
              <button
                onClick={() => onSelectAccent(null)}
                className="text-[11px] text-slate-400 hover:text-red-400 underline underline-offset-2"
              >
                Limpar sotaque
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
