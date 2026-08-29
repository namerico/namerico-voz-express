export interface Language {
  id: string;
  name: string;
  icon: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  geminiVoice: string;
  role: string;
  tagline: string;
  badge: string;
  gender: "M" | "F";
  recommendedFor: string;
  stylePromptModifier?: string;
}

export interface EmotionTone {
  id: string;
  name: string;
  icon: string;
  category: "carro_de_som" | "geral";
  description: string;
  example: string;
}

export interface AccentOption {
  id: string;
  name: string;
  region: string;
}

export interface BackgroundMusicTrack {
  id: string;
  name: string;
  category: "varejo" | "festa" | "agro" | "rua" | "epico" | "radio" | "custom";
  icon: string;
  bpm: number;
  description: string;
  type: "preset" | "uploaded";
  audioBuffer?: AudioBuffer;
  durationSec?: number;
}

export interface VinhetaTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  voice: string;
  emotion: string;
  accent?: string;
  intensity: "normal" | "alta" | "extrema";
  text: string;
  suggestedMusicId?: string;
}

