import React from "react";
import { AudioFxConfig } from "../lib/audioUtils";
import { Sliders, VolumeX, Sparkles, Gauge, Flame, Megaphone, Waves, Speaker } from "lucide-react";

interface AudioEffectsRackProps {
  fx: AudioFxConfig;
  setFx: React.Dispatch<React.SetStateAction<AudioFxConfig>>;
  speed: number;
  setSpeed: (speed: number) => void;
  intensity: "normal" | "alta" | "extrema";
  setIntensity: (intensity: "normal" | "alta" | "extrema") => void;
}

export function AudioEffectsRack({
  fx,
  setFx,
  speed,
  setSpeed,
  intensity,
  setIntensity,
}: AudioEffectsRackProps) {
  const toggleFx = (key: keyof AudioFxConfig) => {
    setFx((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Rack de Efeitos & Processamento de Carro de Som
          </h3>
        </div>
        <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full font-mono">
          DSP Ao Vivo & Exportação
        </span>
      </div>

      {/* FX Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {/* Megafone / Corneta */}
        <button
          onClick={() => toggleFx("megaphone")}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
            fx.megaphone
              ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-500/10"
              : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-300 hover:bg-slate-800"
          }`}
        >
          <div className={`p-1.5 rounded-lg ${fx.megaphone ? "bg-amber-500/30 text-amber-300" : "bg-slate-700/50 text-slate-400"}`}>
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">Corneta de Rua</div>
            <div className="text-[10px] text-slate-400">Som de alto-falante</div>
          </div>
        </button>

        {/* Eco de Rua */}
        <button
          onClick={() => toggleFx("streetEcho")}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
            fx.streetEcho
              ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-500/10"
              : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-300 hover:bg-slate-800"
          }`}
        >
          <div className={`p-1.5 rounded-lg ${fx.streetEcho ? "bg-cyan-500/30 text-cyan-300" : "bg-slate-700/50 text-slate-400"}`}>
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">Eco de Rua</div>
            <div className="text-[10px] text-slate-400">Propaganda volante</div>
          </div>
        </button>

        {/* Bass Boost */}
        <button
          onClick={() => toggleFx("bassBoost")}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
            fx.bassBoost
              ? "bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm shadow-purple-500/10"
              : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-300 hover:bg-slate-800"
          }`}
        >
          <div className={`p-1.5 rounded-lg ${fx.bassBoost ? "bg-purple-500/30 text-purple-300" : "bg-slate-700/50 text-slate-400"}`}>
            <Speaker className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">Grave Woofer</div>
            <div className="text-[10px] text-slate-400">+8dB punch no grave</div>
          </div>
        </button>

        {/* High Clarity */}
        <button
          onClick={() => toggleFx("highClarity")}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
            fx.highClarity
              ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/10"
              : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-300 hover:bg-slate-800"
          }`}
        >
          <div className={`p-1.5 rounded-lg ${fx.highClarity ? "bg-emerald-500/30 text-emerald-300" : "bg-slate-700/50 text-slate-400"}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">Projeção Vocal</div>
            <div className="text-[10px] text-slate-400">Brilho para ar livre</div>
          </div>
        </button>
      </div>

      {/* Sliders and Intensity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        {/* Locution Intensity */}
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Intensidade da Locução:
            </span>
            <span className="font-semibold capitalize text-orange-400">
              {intensity === "extrema" ? "🔥 Extrema (Grito de Oferta)" : intensity === "alta" ? "⚡ Alta (Comercial)" : "Padrão"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setIntensity("normal")}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                intensity === "normal"
                  ? "bg-slate-700 border-slate-500 text-white"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setIntensity("alta")}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                intensity === "alta"
                  ? "bg-amber-500/30 border-amber-500 text-amber-300 shadow-sm"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚡ Alta Varejo
            </button>
            <button
              onClick={() => setIntensity("extrema")}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                intensity === "extrema"
                  ? "bg-red-500/30 border-red-500 text-red-300 shadow-sm"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              🔥 Extrema Impacto
            </button>
          </div>
        </div>

        {/* Speed Slider */}
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              Velocidade da Locução:
            </span>
            <span className="font-mono text-cyan-400 font-semibold">{speed.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex gap-1">
              {[0.9, 1.0, 1.1, 1.25].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                    speed === s
                      ? "bg-cyan-500/30 border-cyan-500 text-cyan-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
