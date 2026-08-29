/**
 * Background Music Generator & Manager for VozExpress Vinhetas
 * Provides high-energy synthetic commercial jingle beds and custom audio decoding
 */

export interface TrackMetadata {
  id: string;
  name: string;
  category: "varejo" | "festa" | "agro" | "rua" | "epico" | "radio" | "custom";
  icon: string;
  bpm: number;
  description: string;
  type: "preset" | "uploaded";
  customBuffer?: AudioBuffer;
  durationSec?: number;
}

// In-memory cache for synthesized and uploaded audio buffers
const bufferCache = new Map<string, AudioBuffer>();

/**
 * Generate synthetic commercial background music loop (stereo AudioBuffer, 8-16 bars)
 */
export function generateSyntheticMusicBuffer(
  audioCtx: BaseAudioContext,
  trackId: string,
  targetDurationSeconds: number = 30
): AudioBuffer {
  const cacheKey = `${trackId}_${targetDurationSeconds}_${audioCtx.sampleRate}`;
  if (bufferCache.has(cacheKey)) {
    return bufferCache.get(cacheKey)!;
  }

  const sampleRate = audioCtx.sampleRate;
  const numSamples = Math.ceil(targetDurationSeconds * sampleRate);
  const audioBuffer = audioCtx.createBuffer(2, numSamples, sampleRate);
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  switch (trackId) {
    case "varejo_eletro":
      renderVarejoEletro(left, right, sampleRate, targetDurationSeconds);
      break;
    case "chamada_festa":
      renderChamadaFesta(left, right, sampleRate, targetDurationSeconds);
      break;
    case "sertanejo_comercial":
      renderSertanejoComercial(left, right, sampleRate, targetDurationSeconds);
      break;
    case "batidao_rua":
      renderBatidaoRua(left, right, sampleRate, targetDurationSeconds);
      break;
    case "impacto_trailer":
      renderImpactoTrailer(left, right, sampleRate, targetDurationSeconds);
      break;
    case "radio_suave":
      renderRadioSuave(left, right, sampleRate, targetDurationSeconds);
      break;
    default:
      renderVarejoEletro(left, right, sampleRate, targetDurationSeconds);
  }

  bufferCache.set(cacheKey, audioBuffer);
  return audioBuffer;
}

/**
 * Decode an uploaded audio file into an AudioBuffer
 */
export async function decodeUploadedAudioFile(
  file: File,
  audioCtx: BaseAudioContext
): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  // Use decodeAudioData
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

// ----------------------------------------------------
// SYNTHESIS ENGINES (Clean, Punchy Commercial Beds)
// ----------------------------------------------------

function renderVarejoEletro(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  duration: number
) {
  const bpm = 128;
  const beatSec = 60 / bpm;
  const totalBeats = Math.floor(duration / beatSec);

  // Chords: Am - F - C - G (Iconic commercial upbeat progression)
  const rootFreqs = [220, 174.61, 261.63, 196.0]; // A3, F3, C4, G3
  const chordNotes = [
    [220, 261.63, 329.63, 440], // Am
    [174.61, 220, 261.63, 349.23], // F
    [261.63, 329.63, 392, 523.25], // C
    [196, 246.94, 293.66, 392], // G
  ];

  for (let beat = 0; beat < totalBeats; beat++) {
    const chordIndex = Math.floor(beat / 4) % 4;
    const notes = chordNotes[chordIndex];
    const bassNote = rootFreqs[chordIndex] / 2; // Bass octave lower
    const beatStartSample = Math.floor(beat * beatSec * sampleRate);

    // 1. Four-on-the-Floor Kick Drum
    const kickLen = Math.floor(0.18 * sampleRate);
    for (let i = 0; i < kickLen && beatStartSample + i < left.length; i++) {
      const t = i / sampleRate;
      const freq = 130 * Math.exp(-t * 28) + 40;
      const env = Math.exp(-t * 16);
      const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.45;
      left[beatStartSample + i] += sample;
      right[beatStartSample + i] += sample;
    }

    // 2. Offbeat Hi-Hat / Shaker (at half-beat)
    const offbeatSample = beatStartSample + Math.floor(0.5 * beatSec * sampleRate);
    const hatLen = Math.floor(0.08 * sampleRate);
    for (let i = 0; i < hatLen && offbeatSample + i < left.length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 45);
      const noise = (Math.random() * 2 - 1) * env * 0.16;
      left[offbeatSample + i] += noise * 0.9;
      right[offbeatSample + i] += noise * 1.1;
    }

    // 3. Synth Bass (16th note groove)
    for (let step = 0; step < 4; step++) {
      const stepStart = beatStartSample + Math.floor(step * 0.25 * beatSec * sampleRate);
      const bassLen = Math.floor(0.12 * sampleRate);
      for (let i = 0; i < bassLen && stepStart + i < left.length; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 20);
        // Sawtooth-like bass tone
        const fundamental = Math.sin(2 * Math.PI * bassNote * t);
        const harmonic = 0.4 * Math.sin(4 * Math.PI * bassNote * t);
        const bassVal = (fundamental + harmonic) * env * 0.22;
        left[stepStart + i] += bassVal;
        right[stepStart + i] += bassVal;
      }
    }

    // 4. Upbeat Synth Stabs (on 2nd and 4th 16th note)
    const stabSteps = [1, 3];
    for (const step of stabSteps) {
      const stabStart = beatStartSample + Math.floor(step * 0.25 * beatSec * sampleRate);
      const stabLen = Math.floor(0.14 * sampleRate);
      for (let i = 0; i < stabLen && stabStart + i < left.length; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 18);
        let chordSample = 0;
        for (const n of notes) {
          chordSample += Math.sin(2 * Math.PI * n * t) + 0.3 * Math.sin(4 * Math.PI * n * t);
        }
        chordSample = (chordSample / notes.length) * env * 0.18;
        left[stabStart + i] += chordSample * 0.8;
        right[stabStart + i] += chordSample * 1.2;
      }
    }

    // 5. Snare Clap on beats 2 & 4
    if (beat % 2 === 1) {
      const snareLen = Math.floor(0.15 * sampleRate);
      for (let i = 0; i < snareLen && beatStartSample + i < left.length; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 22);
        const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 30) * 0.2;
        const noise = (Math.random() * 2 - 1) * env * 0.25;
        const snareVal = tone + noise;
        left[beatStartSample + i] += snareVal;
        right[beatStartSample + i] += snareVal;
      }
    }
  }
}

function renderChamadaFesta(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  duration: number
) {
  const bpm = 135;
  const beatSec = 60 / bpm;
  const totalBeats = Math.floor(duration / beatSec);

  // Fanfare fanfare brass notes: D Major (D4, F#4, A4, D5)
  const brassTones = [293.66, 369.99, 440, 587.33];

  for (let beat = 0; beat < totalBeats; beat++) {
    const beatStart = Math.floor(beat * beatSec * sampleRate);

    // Samba-Reggae / Fanfare Kick
    const kickLen = Math.floor(0.2 * sampleRate);
    for (let i = 0; i < kickLen && beatStart + i < left.length; i++) {
      const t = i / sampleRate;
      const freq = 140 * Math.exp(-t * 25) + 45;
      const sample = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 14) * 0.42;
      left[beatStart + i] += sample;
      right[beatStart + i] += sample;
    }

    // Rolling Snare / Caixa rhythm
    const rolls = [0, 0.25, 0.5, 0.75];
    for (const r of rolls) {
      const rollStart = beatStart + Math.floor(r * beatSec * sampleRate);
      const snareLen = Math.floor(0.09 * sampleRate);
      for (let i = 0; i < snareLen && rollStart + i < left.length; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 35);
        const noise = (Math.random() * 2 - 1) * env * 0.15;
        left[rollStart + i] += noise;
        right[rollStart + i] += noise;
      }
    }

    // Brass Horn Fanfare stabs (every bar or half-bar)
    const noteIdx = (beat % 4);
    const freq = brassTones[noteIdx];
    const hornStart = beatStart + Math.floor(0.5 * beatSec * sampleRate);
    const hornLen = Math.floor(0.22 * sampleRate);
    for (let i = 0; i < hornLen && hornStart + i < left.length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 10);
      const brass = (Math.sin(2 * Math.PI * freq * t) +
        0.5 * Math.sin(4 * Math.PI * freq * t) +
        0.25 * Math.sin(6 * Math.PI * freq * t)) * env * 0.22;
      left[hornStart + i] += brass * 0.85;
      right[hornStart + i] += brass * 1.15;
    }
  }
}

function renderSertanejoComercial(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  duration: number
) {
  const bpm = 112;
  const beatSec = 60 / bpm;
  const totalBeats = Math.floor(duration / beatSec);

  // Sertanejo Arpeggio chords: G - D - Em - C
  const chords = [
    [196, 246.94, 293.66, 392], // G
    [146.83, 220, 293.66, 369.99], // D
    [164.81, 196, 246.94, 329.63], // Em
    [130.81, 164.81, 196, 261.63], // C
  ];

  for (let beat = 0; beat < totalBeats; beat++) {
    const chordIdx = Math.floor(beat / 4) % 4;
    const chord = chords[chordIdx];
    const beatStart = Math.floor(beat * beatSec * sampleRate);

    // Warm Acoustic Kick / Bumbo
    const kickLen = Math.floor(0.2 * sampleRate);
    for (let i = 0; i < kickLen && beatStart + i < left.length; i++) {
      const t = i / sampleRate;
      const freq = 110 * Math.exp(-t * 22) + 38;
      const s = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 12) * 0.38;
      left[beatStart + i] += s;
      right[beatStart + i] += s;
    }

    // Acoustic Guitar Strum Pattern
    const strums = [0, 0.33, 0.66];
    for (let sIdx = 0; sIdx < strums.length; sIdx++) {
      const strumStart = beatStart + Math.floor(strums[sIdx] * beatSec * sampleRate);
      const strumLen = Math.floor(0.18 * sampleRate);
      for (let i = 0; i < strumLen && strumStart + i < left.length; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 15);
        let guitar = 0;
        for (let n = 0; n < chord.length; n++) {
          const delay = n * 0.008; // Strum spread
          if (t > delay) {
            guitar += Math.sin(2 * Math.PI * chord[n] * (t - delay));
          }
        }
        guitar = (guitar / chord.length) * env * 0.18;
        left[strumStart + i] += guitar * (sIdx % 2 === 0 ? 0.9 : 1.1);
        right[strumStart + i] += guitar * (sIdx % 2 === 0 ? 1.1 : 0.9);
      }
    }

    // Sanfona Accordion swell on beat 1 & 3
    if (beat % 2 === 0) {
      const accLen = Math.floor(0.5 * beatSec * sampleRate);
      for (let i = 0; i < accLen && beatStart + i < left.length; i++) {
        const t = i / sampleRate;
        const env = Math.sin((Math.PI * t) / (0.5 * beatSec));
        const lead = Math.sin(2 * Math.PI * chord[2] * t) + 0.3 * Math.sin(6 * Math.PI * chord[2] * t);
        const val = lead * env * 0.12;
        left[beatStart + i] += val;
        right[beatStart + i] += val;
      }
    }
  }
}

function renderBatidaoRua(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  duration: number
) {
  const bpm = 130;
  const beatSec = 60 / bpm;
  const totalBeats = Math.floor(duration / beatSec);

  for (let beat = 0; beat < totalBeats; beat++) {
    const beatStart = Math.floor(beat * beatSec * sampleRate);

    // Deep Sub-Bass 808
    const subLen = Math.floor(0.35 * sampleRate);
    for (let i = 0; i < subLen && beatStart + i < left.length; i++) {
      const t = i / sampleRate;
      const freq = 65 * Math.exp(-t * 8) + 32;
      const sub = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 6) * 0.55;
      left[beatStart + i] += sub;
      right[beatStart + i] += sub;
    }

    // Street Sound Car Snare / Rimshot on beat 2 & 4
    if (beat % 2 === 1) {
      const snareLen = Math.floor(0.12 * sampleRate);
      for (let i = 0; i < snareLen && beatStart + i < left.length; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 28);
        const punch = Math.sin(2 * Math.PI * 260 * t) * Math.exp(-t * 35) * 0.35;
        const noise = (Math.random() * 2 - 1) * env * 0.3;
        const sample = punch + noise;
        left[beatStart + i] += sample;
        right[beatStart + i] += sample;
      }
    }

    // Street Syncopated Shaker
    for (let step = 0; step < 4; step++) {
      const stepStart = beatStart + Math.floor(step * 0.25 * beatSec * sampleRate);
      const shkLen = Math.floor(0.06 * sampleRate);
      for (let i = 0; i < shkLen && stepStart + i < left.length; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 50) * 0.12;
        left[stepStart + i] += noise;
        right[stepStart + i] += noise;
      }
    }
  }
}

function renderImpactoTrailer(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  duration: number
) {
  const bpm = 105;
  const beatSec = 60 / bpm;
  const totalBeats = Math.floor(duration / beatSec);

  for (let beat = 0; beat < totalBeats; beat++) {
    const beatStart = Math.floor(beat * beatSec * sampleRate);

    // Heavy Cinematic Taiko / Sub Boom every 4 beats
    if (beat % 4 === 0) {
      const boomLen = Math.floor(1.2 * sampleRate);
      for (let i = 0; i < boomLen && beatStart + i < left.length; i++) {
        const t = i / sampleRate;
        const f = 80 * Math.exp(-t * 5) + 25;
        const boom = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3) * 0.6;
        left[beatStart + i] += boom;
        right[beatStart + i] += boom;
      }
    }

    // Ticking Clock Pulse
    const tickLen = Math.floor(0.04 * sampleRate);
    for (let i = 0; i < tickLen && beatStart + i < left.length; i++) {
      const t = i / sampleRate;
      const tick = Math.sin(2 * Math.PI * 1600 * t) * Math.exp(-t * 90) * 0.15;
      left[beatStart + i] += tick;
      right[beatStart + i] += tick;
    }

    // Dramatic Low Horn Drone (C2 / G2)
    const hornLen = Math.floor(beatSec * sampleRate);
    for (let i = 0; i < hornLen && beatStart + i < left.length; i++) {
      const t = i / sampleRate;
      const drone = (Math.sin(2 * Math.PI * 65.41 * t) + 0.4 * Math.sin(2 * Math.PI * 98.0 * t)) * 0.15;
      left[beatStart + i] += drone;
      right[beatStart + i] += drone;
    }
  }
}

function renderRadioSuave(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  duration: number
) {
  const bpm = 98;
  const beatSec = 60 / bpm;
  const totalBeats = Math.floor(duration / beatSec);

  // Smooth Jazz / Soft Commercial Chords: Cmaj7 - Am7 - Dm7 - G7
  const chords = [
    [261.63, 329.63, 392.0, 493.88], // Cmaj7
    [220.0, 261.63, 329.63, 392.0],  // Am7
    [146.83, 174.61, 220.0, 261.63], // Dm7
    [196.0, 246.94, 293.66, 349.23], // G7
  ];

  for (let beat = 0; beat < totalBeats; beat++) {
    const chordIdx = Math.floor(beat / 4) % 4;
    const chord = chords[chordIdx];
    const beatStart = Math.floor(beat * beatSec * sampleRate);

    // Warm Soft Kick
    const kickLen = Math.floor(0.18 * sampleRate);
    for (let i = 0; i < kickLen && beatStart + i < left.length; i++) {
      const t = i / sampleRate;
      const f = 90 * Math.exp(-t * 18) + 35;
      const s = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 10) * 0.28;
      left[beatStart + i] += s;
      right[beatStart + i] += s;
    }

    // Soft Rhodes / E-Piano chord
    const rhodesLen = Math.floor(0.45 * beatSec * sampleRate);
    for (let i = 0; i < rhodesLen && beatStart + i < left.length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 5);
      let chordVal = 0;
      for (const f of chord) {
        chordVal += Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(4 * Math.PI * f * t);
      }
      chordVal = (chordVal / chord.length) * env * 0.14;
      left[beatStart + i] += chordVal * 0.9;
      right[beatStart + i] += chordVal * 1.1;
    }

    // Soft Brush Hi-Hat
    const hatStart = beatStart + Math.floor(0.5 * beatSec * sampleRate);
    const hatLen = Math.floor(0.08 * sampleRate);
    for (let i = 0; i < hatLen && hatStart + i < left.length; i++) {
      const t = i / sampleRate;
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 40) * 0.08;
      left[hatStart + i] += noise;
      right[hatStart + i] += noise;
    }
  }
}
