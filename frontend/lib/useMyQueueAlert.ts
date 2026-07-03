'use client';

import { useEffect, useRef, useState } from 'react';
import { getMyStudentId, MY_QUEUE_EVENT } from './myQueue';
import type { QueueEntry } from './types';

let audioCtx: AudioContext | null = null;

/** Mobile browsers only allow AudioContext to start after a user gesture. */
function unlockAudio() {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}

/** Two-tone chime, synthesized so no audio asset is needed. */
function playChime() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [880, 1175].forEach((freq, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = now + i * 0.18;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.35, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx!.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

/**
 * Watches `entries` for the browser's own queue entry (matched by the
 * studentId this browser last used to join — see lib/myQueue.ts) and fires
 * a chime + vibration the moment it flips to "checking", plus flashes the
 * tab title while it's this student's turn. No account/login involved.
 */
export function useMyQueueAlert(entries: QueueEntry[]) {
  const [myStudentId, setMyStudentIdState] = useState<string | null>(null);
  const alertedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setMyStudentIdState(getMyStudentId());
    sync();
    const unlock = () => unlockAudio();
    window.addEventListener(MY_QUEUE_EVENT, sync);
    window.addEventListener('storage', sync);
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => {
      window.removeEventListener(MY_QUEUE_EVENT, sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('pointerdown', unlock);
    };
  }, []);

  const myEntry = myStudentId
    ? (entries.find((e) => e.studentId === myStudentId) ?? null)
    : null;
  const isMyTurn = myEntry?.status === 'checking';

  // Fire the alert once per entry, right when it transitions to "checking".
  useEffect(() => {
    if (!myEntry || myEntry.status !== 'checking') return;
    if (alertedRef.current.has(myEntry._id)) return;
    alertedRef.current.add(myEntry._id);

    playChime();
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
  }, [myEntry]);

  // Flash the tab title so it's noticeable even if the tab isn't focused.
  useEffect(() => {
    if (!isMyTurn) return;
    const original = document.title;
    let flash = false;
    const id = setInterval(() => {
      document.title = flash ? original : '🔔 ถึงคิวคุณแล้ว!';
      flash = !flash;
    }, 1200);
    return () => {
      clearInterval(id);
      document.title = original;
    };
  }, [isMyTurn]);

  return { myStudentId, myEntry, isMyTurn };
}
