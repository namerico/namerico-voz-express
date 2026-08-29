import React, { useState, useRef, useEffect } from "react";
import { 
  Music, 
  Upload, 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Check, 
  Trash2, 
  Sparkles, 
  Sliders,
  AudioWaveform,
  Disc3,
  Layers
} from "lucide-react";
import { BACKGROUND_MUSIC_PRESETS } from "../data/vinhetaData";
import { BackgroundMusicTrack } from "../types";
import { 
  generateSyntheticMusicBuffer, 
  decodeUploadedAudioFile 
} from "../lib/bgMusicManager";
import { playSoloMusicBuffer } from "../lib/audioUtils";

interface BackgroundMusicRackProps {
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string | null, customBuffer?: AudioBuffer | null, customName?: string) => void;
  musicVolume: number;
  setMusicVolume: (vol: number) => void;
  enableDucking: boolean;
  setEnableDucking: (ducking: boolean) => void;
  customTrack: { name: string; buffer: AudioBuffer } | null;
  setCustomTrack: React.Dispatch<React.SetStateAction<{ name: string; buffer: AudioBuffer } | null>>;
  onShowToast: (msg: string) => void;
}

export function BackgroundMusicRack({
  selectedTrackId,
  onSelectTrack,
  musicVolume,
  setMusicVolume,
  enableDucking,
  setEnableDucking,
  customTrack,
  setCustomTrack,
  onShowToast,
}: BackgroundMusicRackProps) {
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
  const soloPlaybackRef = useRef<{ stop: () => void } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      if (soloPlaybackRef.current) {
        soloPlaybackRef.current.stop();
      }
    };
  }, []);

  const handleStopPreview = () => {
    if (soloPlaybackRef.current) {
      soloPlaybackRef.current.stop();
      soloPlaybackRef.current = null;
    }
    setIsPreviewing(null);
  };

  const handlePreviewTrack = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();

    if (isPreviewing === trackId) {
      handleStopPreview();
      return;
    }

    handleStopPreview();

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      
      let buffer: AudioBuffer;
      if (trackId === "custom" && customTrack) {
        buffer = customTrack.buffer;
      } else {
        buffer = generateSyntheticMusicBuffer(audioCtx, trackId, 20);
      }

      setIsPreviewing(trackId);
      const controller = await playSoloMusicBuffer(buffer, musicVolume);
      soloPlaybackRef.current = controller;
    } catch (err) {
      console.error("Erro na pré-escuta da trilha:", err);
      setIsPreviewing(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const decodedBuffer = await decodeUploadedAudioFile(file, audioCtx);

      setCustomTrack({
        name: file.name.replace(/\.[^/.]+$/, ""),
        buffer: decodedBuffer,
      });

      onSelectTrack("custom", decodedBuffer, file.name);
      onShowToast(`Trilha "${file.name}" carregada com sucesso!`);
    } catch (err) {
      console.error("Erro ao carregar arquivo de música:", err);
      alert("Não foi possível processar este arquivo de áudio. Tente outro formato (MP3 ou WAV).");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeCustomTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleStopPreview();
    setCustomTrack(null);
    if (selectedTrackId === "custom") {
      onSelectTrack(null);
    }
    onShowToast("Trilha personalizada removida.");
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header with Title and Volume / Ducking Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              Música de Fundo & Jingle da Vinheta
            </h3>
            <p className="text-[11px] text-slate-400">
              Trilhas comerciais prontas ou suba seu próprio áudio (MP3/WAV)
            </p>
          </div>
        </div>

        {/* Volume & Ducking Quick Controls */}
        <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Volume</span>
                <span className="text-indigo-300 font-bold">{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Auto-Ducking Toggle */}
          <button
            onClick={() => setEnableDucking(!enableDucking)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
              enableDucking
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
            title="Abaixa o volume da música automaticamente enquanto o locutor fala"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Auto-Ducking {enableDucking ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Grid of Background Tracks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Option 1: No Background Music (Voz Acapella) */}
        <button
          onClick={() => {
            handleStopPreview();
            onSelectTrack(null);
          }}
          className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
            selectedTrackId === null
              ? "bg-slate-800/90 border-slate-600 text-white ring-1 ring-slate-400/40 shadow-md"
              : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40"
          }`}
        >
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                <VolumeX className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-200 block">Sem Trilha Sonora</span>
                <span className="text-[10px] text-slate-400 block">Voz pura / Acapella</span>
              </div>
            </div>
            {selectedTrackId === null && (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            Apenas a voz com efeitos de eco/corneta
          </div>
        </button>

        {/* Preset Tracks */}
        {BACKGROUND_MUSIC_PRESETS.map((preset) => {
          const isSelected = selectedTrackId === preset.id;
          const isPlayingThis = isPreviewing === preset.id;

          return (
            <div
              key={preset.id}
              onClick={() => {
                onSelectTrack(preset.id);
              }}
              className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer group ${
                isSelected
                  ? "bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-500/10"
                  : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{preset.icon}</span>
                    <div>
                      <span className="font-bold text-xs text-slate-100 block group-hover:text-indigo-300 transition-colors">
                        {preset.name}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400">
                        {preset.bpm} BPM
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-tight">
                  {preset.description}
                </p>
              </div>

              {/* Preview Button */}
              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={(e) => handlePreviewTrack(e, preset.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    isPlayingThis
                      ? "bg-amber-500 text-black font-bold animate-pulse"
                      : "bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300"
                  }`}
                  title={isPlayingThis ? "Parar prévia" : "Ouvir prévia da trilha"}
                >
                  {isPlayingThis ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>Tocando</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Pré-escuta</span>
                    </>
                  )}
                </button>

                {isSelected && (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-medium">
                    Ativa
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Custom Uploaded Track Card / Upload Button */}
        {customTrack ? (
          <div
            onClick={() => onSelectTrack("custom", customTrack.buffer, customTrack.name)}
            className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer ${
              selectedTrackId === "custom"
                ? "bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/50 shadow-md shadow-emerald-500/10"
                : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Disc3 className="w-4 h-4 animate-spin" style={{ animationDuration: "4s" }} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-100 block truncate max-w-[120px]">
                      {customTrack.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Áudio do Usuário
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {selectedTrackId === "custom" && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <button
                    onClick={removeCustomTrack}
                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remover trilha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-1">
                Sua trilha sonora carregada pronta para mixagem.
              </p>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={(e) => handlePreviewTrack(e, "custom")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  isPreviewing === "custom"
                    ? "bg-amber-500 text-black font-bold animate-pulse"
                    : "bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300"
                }`}
              >
                {isPreviewing === "custom" ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>Tocando</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Pré-escuta</span>
                  </>
                )}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] text-slate-400 hover:text-white underline"
              >
                Trocar
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 bg-slate-950/40 hover:bg-indigo-950/20 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[110px]"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center mb-1.5 transition-colors">
              <Upload className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-200 group-hover:text-indigo-300">
              {isUploading ? "Processando..." : "Subir Minha Trilha"}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Clique para escolher MP3 ou WAV
            </span>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
