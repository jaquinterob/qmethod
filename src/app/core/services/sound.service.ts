import { Injectable, inject, signal } from '@angular/core';
import { MotionPreference } from './motion-preference.service';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private readonly motion = inject(MotionPreference);
  private readonly storageKey = 'qmethod:sound';
  private ctx: AudioContext | null = null;

  readonly enabled = signal(this.loadPreference());

  private get audioCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  toggle(): void {
    this.enabled.update((v) => !v);
    localStorage.setItem(this.storageKey, this.enabled() ? 'on' : 'off');
  }

  playGood(): void {
    if (!this.shouldPlay()) return;
    this.playSequence([
      { freq: 523, duration: 0.08, type: 'sine', gain: 0.3 },
      { freq: 659, duration: 0.08, type: 'sine', gain: 0.3 },
      { freq: 784, duration: 0.12, type: 'sine', gain: 0.25 },
    ]);
  }

  playBad(): void {
    if (!this.shouldPlay()) return;
    this.playTone(180, 0.2, 'square', 0.15);
  }

  playVictory(): void {
    if (!this.shouldPlay()) return;
    this.playSequence([
      { freq: 523, duration: 0.12, type: 'sine', gain: 0.3 },
      { freq: 659, duration: 0.12, type: 'sine', gain: 0.3 },
      { freq: 784, duration: 0.12, type: 'sine', gain: 0.3 },
      { freq: 1047, duration: 0.25, type: 'sine', gain: 0.35 },
    ]);
  }

  playFire(): void {
    if (!this.shouldPlay()) return;
    this.playNoise(0.3, 0.15);
  }

  private shouldPlay(): boolean {
    return this.enabled() && !this.motion.reduced();
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ): void {
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playSequence(
    notes: { freq: number; duration: number; type: OscillatorType; gain: number }[]
  ): void {
    const ctx = this.audioCtx;
    let time = ctx.currentTime;

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = note.type;
      osc.frequency.setValueAtTime(note.freq, time);

      gain.gain.setValueAtTime(note.gain, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + note.duration);

      time += note.duration;
    }
  }

  private playNoise(duration: number, volume: number): void {
    const ctx = this.audioCtx;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime);
  }

  private loadPreference(): boolean {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      return saved === 'on';
    }
    return true;
  }
}
