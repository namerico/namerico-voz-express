import React, { useState } from "react";
import { VoiceProfile } from "../types";
import { VOICES } from "../data/vinhetaData";
import { Mic, CheckCircle2, UserCheck, Sparkles, Filter } from "lucide-react";

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
}

export function VoiceSelector({ selectedVoice, onSelectVoice }: VoiceSelectorProps) {
  const [filterGender, setFilterGender] = useState<"ALL" | "M" | "F">("ALL");

  const filteredVoices = VOICES.filter((v) => {
    if (filterGender === "ALL") return true;
    return v.gender === filterGender;
  });

  const maleCount = VOICES.filter((v) => v.gender === "M").length;
  const femaleCount = VOICES.filter((v) => v.gender === "F").length;

  return (
    <div className="space-y-3">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Vozes Profissionais de Locutor & Locutora
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setFilterGender("ALL")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              filterGender === "ALL"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Todas ({VOICES.length})
          </button>
          <button
            onClick={() => setFilterGender("M")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
              filterGender === "M"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-blue-300"
            }`}
          >
            <span>🎙️ Masculinas ({maleCount})</span>
          </button>
          <button
            onClick={() => setFilterGender("F")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
              filterGender === "F"
                ? "bg-pink-600 text-white shadow-sm"
                : "text-slate-400 hover:text-pink-300"
            }`}
          >
            <span>👩 Femininas ({femaleCount})</span>
          </button>
        </div>
      </div>

      {/* Grid of Voices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {filteredVoices.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onSelectVoice(v.id)}
              className={`text-left p-3 rounded-xl border transition-all relative group flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/50 shadow-md shadow-amber-500/5"
                  : "bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-100">{v.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                        v.gender === "M"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                      }`}
                    >
                      {v.gender === "M" ? "Masc" : "Fem"}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 animate-in fade-in" />
                  )}
                </div>

                <div className="text-xs font-semibold text-amber-300 mb-0.5">
                  {v.role}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight mb-2">
                  {v.tagline}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 mt-auto">
                <span className="inline-block text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full truncate max-w-full">
                  {v.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
