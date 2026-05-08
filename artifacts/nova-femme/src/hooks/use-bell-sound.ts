import { useEffect, useRef, useCallback } from "react";

export function useBellSound(src: string) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const activeGainRef = useRef<GainNode | null>(null);

  // Preload audio buffer on mount
  useEffect(() => {
    const AudioCtx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => {
        bufferRef.current = buf;
      })
      .catch(() => {});

    return () => {
      ctx.close().catch(() => {});
    };
  }, [src]);

  const _playBuffer = useCallback((volume: number, stopActive: boolean) => {
    const ctx = ctxRef.current;
    const buf = bufferRef.current;
    if (!ctx || !buf) return;

    // Browser policy: resume suspended context on first user interaction
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // Stop (fade out) any currently playing bell so clicks don't pile up
    if (stopActive && activeGainRef.current) {
      const prev = activeGainRef.current;
      prev.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06);
      setTimeout(() => {
        try { prev.disconnect(); } catch { /* already disconnected */ }
      }, 120);
      activeGainRef.current = null;
    }

    const source = ctx.createBufferSource();
    source.buffer = buf;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    if (stopActive) {
      activeGainRef.current = gain;
      source.onended = () => {
        if (activeGainRef.current === gain) activeGainRef.current = null;
      };
    }
  }, []);

  /** Normal bell at 40% — restarts instantly on rapid clicks */
  const play = useCallback(() => {
    _playBuffer(0.4, true);
  }, [_playBuffer]);

  /**
   * Celebration bell — slightly louder (50%) + one echo at 25%
   * after 750ms to mark the moment of fullness / pełnia.
   */
  const playWithEcho = useCallback(() => {
    _playBuffer(0.5, true);
    setTimeout(() => _playBuffer(0.25, false), 750);
  }, [_playBuffer]);

  return { play, playWithEcho };
}
