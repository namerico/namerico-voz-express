/**
 * Audio Utilities for VozExpress - Carro de Som & Vinhetas
 */

export interface AudioFxConfig {
  megaphone: boolean;   // Corneta / Megafone de Rua
  streetEcho: boolean;  // Eco de Rua / Propaganda Volante
  bassBoost: boolean;   // Grave Pesado / Woofer
  highClarity: boolean; // Presença / Agudos de Projeção
}

/**
 * Decode Base64 PCM (16-bit signed, 24kHz mono) into AudioBuffer
 */
export function decodeBase64ToAudioBuffer(
  audioCtx: AudioContext | OfflineAudioContext,
  base64Data: string,
  sampleRate: number = 24000
): AudioBuffer {
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const float32Data = new Float32Array(bytes.length / 2);
  const dataView = new DataView(bytes.buffer);

  for (let i = 0; i < float32Data.length; i++) {
    float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
  }

  const audioBuffer = audioCtx.createBuffer(1, float32Data.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Data);
  return audioBuffer;
}

/**
 * Build Audio FX Graph onto a destination
 */
export function applyFxChain(
  audioCtx: AudioContext | OfflineAudioContext,
  sourceNode: AudioNode,
  fx: AudioFxConfig
): AudioNode {
  let currentNode: AudioNode = sourceNode;

  // 1. Megafone / Corneta de Carro de Som (Bandpass Filter + slight distortion)
  if (fx.megaphone) {
    const highpass = audioCtx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 450;

    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 3600;

    const peak = audioCtx.createBiquadFilter();
    peak.type = "peaking";
    peak.frequency.value = 1800;
    peak.gain.value = 6;

    currentNode.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(peak);
    currentNode = peak;
  }

  // 2. Bass Boost (Grave de Woofer)
  if (fx.bassBoost) {
    const lowShelf = audioCtx.createBiquadFilter();
    lowShelf.type = "lowshelf";
    lowShelf.frequency.value = 140;
    lowShelf.gain.value = 8.5;

    currentNode.connect(lowShelf);
    currentNode = lowShelf;
  }

  // 3. Projeção / Brilho de Locução
  if (fx.highClarity) {
    const highShelf = audioCtx.createBiquadFilter();
    highShelf.type = "highshelf";
    highShelf.frequency.value = 3500;
    highShelf.gain.value = 5;

    currentNode.connect(highShelf);
    currentNode = highShelf;
  }

  // 4. Eco de Rua / Reverb de Propaganda Volante
  if (fx.streetEcho) {
    const delay = audioCtx.createDelay(1.0);
    delay.delayTime.value = 0.17; // 170ms delay (classic street sound car echo)

    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.35;

    const echoFilter = audioCtx.createBiquadFilter();
    echoFilter.type = "lowpass";
    echoFilter.frequency.value = 2500;

    const wetGain = audioCtx.createGain();
    wetGain.gain.value = 0.4;

    const dryGain = audioCtx.createGain();
    dryGain.gain.value = 1.0;

    const merger = audioCtx.createGain();

    // Dry path
    currentNode.connect(dryGain);
    dryGain.connect(merger);

    // Wet / Delay path
    currentNode.connect(delay);
    delay.connect(echoFilter);
    echoFilter.connect(feedback);
    feedback.connect(delay);
    echoFilter.connect(wetGain);
    wetGain.connect(merger);

    currentNode = merger;
  }

  return currentNode;
}

/**
 * Render processed audio (with voice FX + background music bed + ducking) offline and export as WAV Blob
 */
export async function exportProcessedWavBlob(
  base64Data: string,
  rate: number = 1.0,
  fx: AudioFxConfig = { megaphone: false, streetEcho: false, bassBoost: false, highClarity: false },
  musicBuffer?: AudioBuffer | null,
  musicVolume: number = 0.3,
  enableDucking: boolean = true,
  sampleRate: number = 24000
): Promise<Blob> {
  const hasFx = fx.megaphone || fx.streetEcho || fx.bassBoost || fx.highClarity || rate !== 1.0;
  const hasMusic = Boolean(musicBuffer && musicVolume > 0);

  if (!hasFx && !hasMusic) {
    return base64PCMToWavBlob(base64Data, sampleRate);
  }

  const rawBinary = window.atob(base64Data);
  const totalSamples = rawBinary.length / 2;
  const voiceDuration = (totalSamples / sampleRate) / rate;
  // Extra tail for music outro and reverb
  const effectiveDuration = voiceDuration + (fx.streetEcho ? 1.5 : 0.8);
  const targetSampleRate = 44100;
  const renderLength = Math.ceil(effectiveDuration * targetSampleRate);

  const OfflineContextClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const offlineCtx = new OfflineContextClass(2, renderLength, targetSampleRate);

  // 1. Voice Source
  const voiceBuffer = decodeBase64ToAudioBuffer(offlineCtx, base64Data, sampleRate);
  const voiceSource = offlineCtx.createBufferSource();
  voiceSource.buffer = voiceBuffer;
  voiceSource.playbackRate.value = rate;

  const processedVoice = applyFxChain(offlineCtx, voiceSource, fx);
  const voiceGain = offlineCtx.createGain();
  voiceGain.gain.value = 1.0;
  processedVoice.connect(voiceGain);
  voiceGain.connect(offlineCtx.destination);

  // 2. Background Music Source (if present)
  if (hasMusic && musicBuffer) {
    const musicSource = offlineCtx.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.loop = true;

    const musicGainNode = offlineCtx.createGain();
    
    if (enableDucking) {
      // Ducking envelope: start at moderate volume, duck during voice, swell at the end, fade out
      const duckedVolume = musicVolume * 0.35;
      musicGainNode.gain.setValueAtTime(musicVolume * 0.8, 0);
      musicGainNode.gain.linearRampToValueAtTime(duckedVolume, 0.2);
      
      if (voiceDuration > 0.5) {
        musicGainNode.gain.setValueAtTime(duckedVolume, Math.max(0, voiceDuration - 0.3));
        musicGainNode.gain.linearRampToValueAtTime(musicVolume, voiceDuration + 0.2);
      }
      
      // Fade out at the end
      musicGainNode.gain.setValueAtTime(musicVolume, Math.max(0, effectiveDuration - 0.6));
      musicGainNode.gain.linearRampToValueAtTime(0.001, effectiveDuration);
    } else {
      musicGainNode.gain.setValueAtTime(musicVolume, 0);
      musicGainNode.gain.setValueAtTime(musicVolume, Math.max(0, effectiveDuration - 0.5));
      musicGainNode.gain.linearRampToValueAtTime(0.001, effectiveDuration);
    }

    musicSource.connect(musicGainNode);
    musicGainNode.connect(offlineCtx.destination);
    musicSource.start(0);
    musicSource.stop(effectiveDuration);
  }

  voiceSource.start(0);
  const renderedBuffer = await offlineCtx.startRendering();

  return audioBufferToWavBlob(renderedBuffer);
}

/**
 * Play PCM audio with live speed, Carro de Som FX and Background Music
 */
export async function playBase64AudioWithRateAndFx(
  base64Data: string,
  rate: number = 1.0,
  fx: AudioFxConfig = { megaphone: false, streetEcho: false, bassBoost: false, highClarity: false },
  musicBuffer?: AudioBuffer | null,
  musicVolume: number = 0.3,
  enableDucking: boolean = true,
  sampleRate: number = 24000
) {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const voiceBuffer = decodeBase64ToAudioBuffer(audioContext, base64Data, sampleRate);
  const voiceSource = audioContext.createBufferSource();
  voiceSource.buffer = voiceBuffer;
  voiceSource.playbackRate.value = rate;

  const processedNode = applyFxChain(audioContext, voiceSource, fx);
  processedNode.connect(audioContext.destination);

  let musicSource: AudioBufferSourceNode | null = null;
  let musicGainNode: GainNode | null = null;

  const voiceDuration = voiceBuffer.duration / rate;

  if (musicBuffer && musicVolume > 0) {
    musicSource = audioContext.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.loop = true;

    musicGainNode = audioContext.createGain();

    if (enableDucking) {
      const duckedVolume = musicVolume * 0.35;
      musicGainNode.gain.setValueAtTime(musicVolume * 0.8, audioContext.currentTime);
      musicGainNode.gain.linearRampToValueAtTime(duckedVolume, audioContext.currentTime + 0.2);

      if (voiceDuration > 0.5) {
        musicGainNode.gain.setValueAtTime(duckedVolume, audioContext.currentTime + voiceDuration - 0.2);
        musicGainNode.gain.linearRampToValueAtTime(musicVolume, audioContext.currentTime + voiceDuration + 0.2);
      }
      
      musicGainNode.gain.setValueAtTime(musicVolume, audioContext.currentTime + voiceDuration + 0.6);
      musicGainNode.gain.linearRampToValueAtTime(0.001, audioContext.currentTime + voiceDuration + 1.2);
    } else {
      musicGainNode.gain.setValueAtTime(musicVolume, audioContext.currentTime);
      musicGainNode.gain.setValueAtTime(musicVolume, audioContext.currentTime + voiceDuration + 0.5);
      musicGainNode.gain.linearRampToValueAtTime(0.001, audioContext.currentTime + voiceDuration + 1.0);
    }

    musicSource.connect(musicGainNode);
    musicGainNode.connect(audioContext.destination);
    musicSource.start(0);
    musicSource.stop(audioContext.currentTime + voiceDuration + 1.3);
  }

  voiceSource.start(0);

  return {
    stop: () => {
      try {
        voiceSource.stop();
        if (musicSource) musicSource.stop();
        audioContext.close();
      } catch (e) {}
    },
    promise: new Promise<void>((resolve) => {
      voiceSource.onended = () => {
        setTimeout(() => {
          try {
            audioContext.close();
          } catch (e) {}
          resolve();
        }, musicBuffer ? 1200 : 100);
      };
    }),
  };
}

/**
 * Preview a solo music track buffer
 */
export async function playSoloMusicBuffer(
  audioBuffer: AudioBuffer,
  volume: number = 0.5
) {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = true;

  const gain = audioContext.createGain();
  gain.gain.value = volume;

  source.connect(gain);
  gain.connect(audioContext.destination);
  source.start(0);

  return {
    stop: () => {
      try {
        source.stop();
        audioContext.close();
      } catch (e) {}
    },
  };
}


/**
 * Convert AudioBuffer to WAV Blob with full multi-channel / stereo support
 */
export function audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const totalSamplesPerChannel = audioBuffer.length;
  const dataByteLength = totalSamplesPerChannel * numChannels * 2;
  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* file length (36 + data length) */
  view.setUint32(4, 36 + dataByteLength, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (1 = PCM) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate = sampleRate * numChannels * bitsPerSample / 8 */
  view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align = numChannels * bitsPerSample / 8 */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, dataByteLength, true);

  // Write interleaved 16-bit PCM samples
  let offset = 44;
  if (numChannels === 2) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    for (let i = 0; i < totalSamplesPerChannel; i++) {
      const sL = Math.max(-1, Math.min(1, left[i]));
      view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
      offset += 2;

      const sR = Math.max(-1, Math.min(1, right[i]));
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
      offset += 2;
    }
  } else {
    const mono = audioBuffer.getChannelData(0);
    for (let i = 0; i < totalSamplesPerChannel; i++) {
      const s = Math.max(-1, Math.min(1, mono[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}

/**
 * Direct Base64 PCM to WAV Blob
 */
export function base64PCMToWavBlob(base64Data: string, sampleRate: number = 24000): Blob {
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const pcmData = new Int16Array(bytes.buffer);
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmData.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, pcmData.length * 2, true);

  return new Blob([wavHeader, pcmData], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Soundboard Synthesizers for Vinheta effects
 */
export function playSoundboardFx(type: "siren" | "horn" | "chime" | "laser" | "radio_beep") {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioContextClass();
  const now = ctx.currentTime;

  if (type === "siren") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.35);
    osc.frequency.linearRampToValueAtTime(450, now + 0.7);
    osc.frequency.linearRampToValueAtTime(950, now + 1.05);
    osc.frequency.linearRampToValueAtTime(400, now + 1.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.45);
  } else if (type === "horn") {
    // Dual frequency truck / air horn
    [320, 480, 640].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    });
  } else if (type === "chime") {
    // Attention Gongo / Chime
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.25, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 1.25);
    });
  } else if (type === "laser") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  } else if (type === "radio_beep") {
    [0, 0.15].forEach((delayTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, now + delayTime);

      gain.gain.setValueAtTime(0.25, now + delayTime);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delayTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delayTime);
      osc.stop(now + delayTime + 0.09);
    });
  }
}
