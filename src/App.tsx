import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  MicOff,
  Play, 
  Square, 
  Volume2, 
  Languages, 
  Sparkles, 
  Download, 
  Trash2, 
  Clock, 
  Radio, 
  Megaphone,
  BookOpen, 
  Wand2, 
  Sliders, 
  Check, 
  AlertCircle, 
  Loader2,
  Share2,
  RefreshCw,
  Music
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { convertTextToSpeech, transcribeAudio } from "./lib/gemini";
import { 
  playBase64AudioWithRateAndFx, 
  exportProcessedWavBlob, 
  AudioFxConfig 
} from "./lib/audioUtils";
import { generateSyntheticMusicBuffer } from "./lib/bgMusicManager";
import { LANGUAGES, VOICES, EMOTIONS, VINHETA_TEMPLATES, BACKGROUND_MUSIC_PRESETS } from "./data/vinhetaData";
import { VinhetaTemplate } from "./types";
import { Soundboard } from "./components/Soundboard";
import { AudioEffectsRack } from "./components/AudioEffectsRack";
import { VoiceSelector } from "./components/VoiceSelector";
import { TonesAndEmotions } from "./components/TonesAndEmotions";
import { BackgroundMusicRack } from "./components/BackgroundMusicRack";
import { VinhetaTemplatesModal } from "./components/VinhetaTemplatesModal";
import { VinhetaAiGeneratorModal } from "./components/VinhetaAiGeneratorModal";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { getApiKey } from "./lib/gemini";
import { Key } from "lucide-react";

export default function App() {
  // Core Text & Voice States
  const [text, setText] = useState(
    "Atenção dona de casa! Olha o carro do ovo passando na sua porta! É o ovo graúdo, selecionado da granja para sua mesa! São 30 ovos graúdos por apenas dez reais!"
  );
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [voice, setVoice] = useState(VOICES[0].id); // Fenrir Varejo default
  const [emotion, setEmotion] = useState<string | null>("carro_rua");
  const [accent, setAccent] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<"normal" | "alta" | "extrema">("alta");
  const [speed, setSpeed] = useState(1.0);

  // Audio FX state (Carro de Som)
  const [fx, setFx] = useState<AudioFxConfig>({
    megaphone: false,
    streetEcho: true, // Eco de rua enabled by default
    bassBoost: true,  // Grave woofer enabled by default
    highClarity: false,
  });

  // Background Music State
  const [selectedMusicTrackId, setSelectedMusicTrackId] = useState<string | null>("varejo_eletro");
  const [musicVolume, setMusicVolume] = useState(0.28);
  const [enableDucking, setEnableDucking] = useState(true);
  const [customTrack, setCustomTrack] = useState<{ name: string; buffer: AudioBuffer } | null>(null);

  // Playback & Processing States
  const [isConverting, setIsConverting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastAudioBase64, setLastAudioBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Recording & Transcription
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const playbackRef = useRef<{ stop: () => void; promise: Promise<void> } | null>(null);

  // Clean accent if not Portuguese
  useEffect(() => {
    if (language.id !== "pt-BR") {
      setAccent(null);
    }
  }, [language]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Helper to obtain current music AudioBuffer
  const getActiveMusicBuffer = (audioCtx: BaseAudioContext): AudioBuffer | null => {
    if (!selectedMusicTrackId) return null;
    if (selectedMusicTrackId === "custom" && customTrack) {
      return customTrack.buffer;
    }
    return generateSyntheticMusicBuffer(audioCtx, selectedMusicTrackId, 45);
  };

  // TTS Conversion & Playback
  const handleGenerateAndPlay = async () => {
    if (!text.trim()) {
      setError("Por favor, digite o roteiro da vinheta.");
      return;
    }

    try {
      if (playbackRef.current) {
        playbackRef.current.stop();
        playbackRef.current = null;
        setIsPlaying(false);
      }

      setIsConverting(true);
      setError(null);
      setProgress(15);

      const progressInterval = setInterval(() => {
        setProgress((p) => (p < 88 ? p + Math.floor(Math.random() * 8 + 3) : p));
      }, 180);

      const voiceObj = VOICES.find((v) => v.id === voice) || VOICES[0];

      const base64 = await convertTextToSpeech(text, {
        language: language.name,
        emotion: emotion || undefined,
        accent: accent || undefined,
        voiceName: voiceObj.geminiVoice || "Fenrir",
        voiceStyleModifier: voiceObj.stylePromptModifier,
        intensity: intensity,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (base64) {
        setLastAudioBase64(base64);
        setIsConverting(false);
        setProgress(0);

        // Start playback with active Carro de Som FX, Speed & Background Music
        setIsPlaying(true);
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtxClass();
        const musicBuf = getActiveMusicBuffer(audioCtx);

        const controller = await playBase64AudioWithRateAndFx(
          base64, 
          speed, 
          fx, 
          musicBuf, 
          musicVolume, 
          enableDucking
        );
        playbackRef.current = controller;

        controller.promise.then(() => {
          setIsPlaying(false);
          playbackRef.current = null;
        });

        showToast("Vinheta completa com trilha e locução pronta!");
      } else {
        throw new Error("Nenhum áudio retornado pelo modelo.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao gerar locução. Verifique sua chave da API Gemini e tente novamente.");
      setIsConverting(false);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  // Replay Last Audio with current FX / Speed / Music
  const handleReplayCurrentAudio = async () => {
    if (!lastAudioBase64) return;

    if (playbackRef.current) {
      playbackRef.current.stop();
      playbackRef.current = null;
      setIsPlaying(false);
    }

    setIsPlaying(true);
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtxClass();
    const musicBuf = getActiveMusicBuffer(audioCtx);

    const controller = await playBase64AudioWithRateAndFx(
      lastAudioBase64, 
      speed, 
      fx, 
      musicBuf, 
      musicVolume, 
      enableDucking
    );
    playbackRef.current = controller;

    controller.promise.then(() => {
      setIsPlaying(false);
      playbackRef.current = null;
    });
  };

  const handleStopPlayback = () => {
    if (playbackRef.current) {
      playbackRef.current.stop();
      playbackRef.current = null;
    }
    setIsPlaying(false);
  };

  // Download Audio with applied DSP Effects and mixed Background Track
  const handleDownload = async () => {
    if (!lastAudioBase64) {
      setError("Gere uma locução primeiro antes de baixar.");
      return;
    }

    try {
      showToast("Renderizando vinheta completa (Voz + Efeitos + Trilha)...");
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const musicBuf = getActiveMusicBuffer(audioCtx);

      const wavBlob = await exportProcessedWavBlob(
        lastAudioBase64, 
        speed, 
        fx, 
        musicBuf, 
        musicVolume, 
        enableDucking
      );
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;

      const voiceInfo = VOICES.find((v) => v.id === voice)?.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "locutor";
      const fxSuffix = [
        fx.streetEcho ? "eco" : "",
        fx.megaphone ? "corneta" : "",
        fx.bassBoost ? "grave" : "",
        selectedMusicTrackId ? "trilha" : "",
      ]
        .filter(Boolean)
        .join("-");

      a.download = `vinheta-carro-som-${voiceInfo}${fxSuffix ? `-${fxSuffix}` : ""}-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Download da vinheta concluído!");
    } catch (err) {
      console.error("Erro ao baixar áudio:", err);
      setError("Erro ao exportar o arquivo de áudio.");
    }
  };

  // Audio Recording for Dictation
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          setIsTranscribing(true);
          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Data = (reader.result as string).split(",")[1];
              const transcribedText = await transcribeAudio(base64Data, "audio/wav");
              if (transcribedText) {
                setText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
                showToast("Transcrição adicionada com sucesso!");
              }
              setIsTranscribing(false);
            };
          } catch (err) {
            console.error(err);
            setError("Erro ao transcrever o áudio.");
            setIsTranscribing(false);
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error(err);
        setError("Não foi possível acessar o microfone.");
      }
    }
  };

  const applyTemplate = (template: VinhetaTemplate) => {
    setText(template.text);
    setVoice(template.voice);
    setEmotion(template.emotion);
    if (template.accent) setAccent(template.accent);
    setIntensity(template.intensity);
    if (template.suggestedMusicId) {
      setSelectedMusicTrackId(template.suggestedMusicId);
    }
    showToast(`Modelo "${template.title}" carregado!`);
  };

  const selectedVoiceObj = VOICES.find((v) => v.id === voice) || VOICES[0];
  const activeMusicObj = BACKGROUND_MUSIC_PRESETS.find((p) => p.id === selectedMusicTrackId);
  const activeFxCount = [fx.megaphone, fx.streetEcho, fx.bassBoost, fx.highClarity].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs"
          >
            <Check className="w-4 h-4" />
            {successToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950">
              <Megaphone className="w-5 h-5 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">
                  VozExpress <span className="text-amber-400">PRO</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
                  Carro de Som & Vinhetas
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Estúdio Completo com Locutores de Varejo, Trilhas Comerciais & Mixagem DSP
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language.id}
                onChange={(e) => {
                  const selected = LANGUAGES.find((l) => l.id === e.target.value);
                  if (selected) setLanguage(selected);
                }}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.icon} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key Config Button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Configurar Chave da API Gemini"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Chave Gemini</span>
            </button>

            {/* Quick AI Button */}
            <button
              onClick={() => setIsAiGeneratorOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Roteiro com IA</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800 rounded-2xl flex items-center justify-between gap-3 text-red-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="underline text-red-400 hover:text-red-200"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Editor & Master Controls & Background Music (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Vinheta Quick Presets Bar */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-400" />
                Modelos Rápidos:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {VINHETA_TEMPLATES.slice(0, 4).map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => applyTemplate(tmpl)}
                    className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{tmpl.icon}</span>
                    <span>{tmpl.title.split("-")[0].trim()}</span>
                  </button>
                ))}
                <button
                  onClick={() => setIsTemplatesOpen(true)}
                  className="text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-xl whitespace-nowrap font-medium transition-colors cursor-pointer"
                >
                  + Mais Modelos
                </button>
              </div>
            </div>

            {/* Text Editor Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl relative focus-within:border-amber-500/50 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Roteiro para Locução
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    {text.length} caracteres
                  </span>
                  <button
                    onClick={() => setText("")}
                    title="Limpar texto"
                    className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva aqui o texto da vinheta ou propaganda para o carro de som..."
                rows={5}
                className="w-full bg-transparent text-slate-100 text-base leading-relaxed focus:outline-none resize-none placeholder:text-slate-600 font-sans"
              />

              {/* Bottom toolbar inside Editor */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 mt-2">
                <div className="flex items-center gap-2">
                  {/* Mic Dictation */}
                  <button
                    onClick={toggleRecording}
                    disabled={isTranscribing}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isRecording
                        ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-amber-400" />}
                    {isRecording ? "Gravando..." : isTranscribing ? "Transcrevendo..." : "Ditar com Voz"}
                  </button>

                  {/* AI Generate Assistant */}
                  <button
                    onClick={() => setIsAiGeneratorOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Gerar com IA
                  </button>
                </div>

                {/* Active Voice summary badge */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  <span>Locutor:</span>
                  <strong className="text-amber-400">{selectedVoiceObj.name.split("-")[0].trim()}</strong>
                  <span>•</span>
                  <span className="text-slate-300 font-medium">
                    {intensity === "extrema" ? "🔥 Extrema" : intensity === "alta" ? "⚡ Varejo" : "Normal"}
                  </span>
                </div>
              </div>
            </div>

            {/* Background Music Rack */}
            <BackgroundMusicRack
              selectedTrackId={selectedMusicTrackId}
              onSelectTrack={(tId, cBuf, cName) => {
                setSelectedMusicTrackId(tId);
                if (cBuf && cName) {
                  setCustomTrack({ name: cName, buffer: cBuf });
                }
              }}
              musicVolume={musicVolume}
              setMusicVolume={setMusicVolume}
              enableDucking={enableDucking}
              setEnableDucking={setEnableDucking}
              customTrack={customTrack}
              setCustomTrack={setCustomTrack}
              onShowToast={showToast}
            />

            {/* Progress Bar when converting */}
            {isConverting && (
              <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-amber-300">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sintetizando locução neural com Gemini e preparando trilha...
                  </span>
                  <span className="font-mono">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Master Action Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Main Play / Generate Button */}
                <button
                  onClick={handleGenerateAndPlay}
                  disabled={isConverting}
                  className="sm:col-span-8 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando Vinheta...
                    </>
                  ) : isPlaying ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Tocando Vinheta (Clique p/ Recriar)
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Gerar e Tocar Vinheta Completa
                    </>
                  )}
                </button>

                {/* Stop button (if playing) */}
                {isPlaying && (
                  <button
                    onClick={handleStopPlayback}
                    className="sm:col-span-4 py-3.5 px-4 rounded-2xl font-bold text-xs uppercase bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Parar Áudio
                  </button>
                )}

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={!lastAudioBase64}
                  className={`${
                    isPlaying ? "sm:col-span-12" : "sm:col-span-4"
                  } py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                    lastAudioBase64
                      ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
                      : "bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Baixar Vinheta Pronta
                </button>
              </div>

              {/* Status and Active FX description */}
              {lastAudioBase64 && (
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Vinheta pronta na memória.</span>
                    <button
                      onClick={handleReplayCurrentAudio}
                      className="text-amber-400 hover:underline font-medium cursor-pointer"
                    >
                      Ouvir novamente
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>
                      Trilha:{" "}
                      <strong className="text-indigo-300">
                        {selectedMusicTrackId === "custom"
                          ? customTrack?.name || "Personalizada"
                          : activeMusicObj?.name.split("(")[0] || "Sem trilha"}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Filtros:{" "}
                      <span className="text-slate-300">
                        {activeFxCount > 0 ? `${activeFxCount} DSP ativos` : "Puro"}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Soundboard FX Section */}
            <Soundboard />
          </div>

          {/* Right Column: Controls, FX Rack, Voices & Emotions (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* DSP Audio FX Rack */}
            <AudioEffectsRack
              fx={fx}
              setFx={setFx}
              speed={speed}
              setSpeed={setSpeed}
              intensity={intensity}
              setIntensity={setIntensity}
            />

            {/* Voice Selector with 8 Male Locutores + Female Options */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <VoiceSelector
                selectedVoice={voice}
                onSelectVoice={(vId) => setVoice(vId)}
              />
            </div>

            {/* Tones, Emotions and Accents */}
            <TonesAndEmotions
              selectedEmotion={emotion}
              onSelectEmotion={(emo) => setEmotion(emo)}
              selectedAccent={accent}
              onSelectAccent={(acc) => setAccent(acc)}
              languageId={language.id}
            />
          </div>
        </div>
        {/* Api Key Modal */}
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSaved={() => {
            showToast("Chave da API Gemini configurada com sucesso!");
            setError(null);
          }}
        />
      </main>

      {/* Modals */}
      <VinhetaTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onApplyTemplate={applyTemplate}
      />

      <VinhetaAiGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onApplyScript={(script) => {
          setText(script);
          showToast("Roteiro aplicado no editor!");
        }}
      />
    </div>
  );
}
