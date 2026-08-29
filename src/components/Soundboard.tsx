import React, { useState } from "react";
import { Volume2, Sparkles, Bell, Radio, Zap, AlertTriangle } from "lucide-react";
import { playSoundboardFx } from "../lib/audioUtils";

interface SoundboardProps {
  onFxPlayed?: (type: string) => void;
}

export function Soundboard({ onFxPlayed }: SoundboardProps) {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handlePlayFx = (type: "siren" | "horn" | "chime" | "laser" | "radio_beep") => {
    setActiveButton(type);
    playSoundboardFx(type);
    if (onFxPlayed) onFxPlayed(type);
    setTimeout(() => setActiveButton(null), 1200);
  };

  const fxList: Array<{
    id: "siren" | "horn" | "chime" | "laser" | "radio_beep";
    name: string;
    icon: any;
    desc: string;
    color: string;
  }> = [
    {
      id: "siren",
      name: "Sirene de Urgência",
      icon: AlertTriangle,
      desc: "Chama atenção instantânea",
      color: "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20",
    },
    {
      id: "horn",
      name: "Buzina de Ar / Corneta",
      icon: Volume2,
      desc: "Som potente de caminhão",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
    },
    {
      id: "chime",
      name: "Gongo de Atenção",
      icon: Bell,
      desc: "Aviso sonoro elegante",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
    },
    {
      id: "laser",
      name: "Laser de Transição",
      icon: Zap,
      desc: "Impacto e transição rápida",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20",
    },
    {
      id: "radio_beep",
      name: "Beep de Rádio Varejo",
      icon: Radio,
      desc: "Vinheta clássica de rádio",
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20",
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Efeitos Sonoros de Vinheta (Soundboard ao Vivo)
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">Sons instantâneos de impacto</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {fxList.map((fx) => {
          const Icon = fx.icon;
          const isActive = activeButton === fx.id;
          return (
            <button
              key={fx.id}
              onClick={() => handlePlayFx(fx.id)}
              className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all duration-150 relative overflow-hidden group ${
                fx.color
              } ${isActive ? "scale-95 ring-2 ring-amber-400" : "hover:scale-[1.02]"}`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-white/10 animate-ping pointer-events-none" />
              )}
              <Icon className={`w-5 h-5 mb-1.5 transition-transform ${isActive ? "animate-bounce" : "group-hover:scale-110"}`} />
              <span className="text-xs font-semibold leading-tight text-slate-200">{fx.name}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{fx.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
