"use client";

import { useRef, useCallback, useEffect } from "react";

// ─── Sprite key type (derived from auth-sprite.json) ──────────────────────────
export type AuthSoundKey =
  | "btn-primary-launch"
  | "btn-register-launch"
  | "auth-error-msg"
  | "btn-secondary-action"
  | "ui-eye-toggle"
  | "ui-checkbox-check"
  | "ui-dropdown-open"
  | "ui-theme-toggle"
  | "ui-link-auth-switch"
  | "ui-link-forget-pass";

// ─── Minimal Howl type to avoid importing @types/howler at the module level ───
type HowlInstance = {
  play: (key: AuthSoundKey | "silence") => number;
  stop: (id?: number) => void;
  volume: (vol?: number) => number | void;
  mute: (muted?: boolean) => boolean | void;
  state: () => "unloaded" | "loading" | "loaded";
};

type HowlConstructorOptions = {
  src: string[];
  sprite: Record<string, [number, number] | [number, number, boolean]>;
  preload: boolean;
  html5?: boolean;
  volume?: number;
};

type HowlConstructor = new (opts: HowlConstructorOptions) => HowlInstance;

// ─── Sprite map exactly matching Audio/Auth/auth-sprite.json ─────────────────
const SPRITE_MAP: HowlConstructorOptions["sprite"] = {
  silence: [0, 50, true],
  "auth-error-msg": [550, 1108.7528344671202],
  "btn-primary-launch": [3050, 2998.140589569161],
  "btn-register-launch": [6550, 1688.8435374149653],
  "btn-secondary-action": [9050, 2000],
  "ui-checkbox-check": [11550, 500],
  "ui-dropdown-open": [13050, 509.9999999999998],
  "ui-eye-toggle": [14550, 1137.777777777778],
  "ui-link-auth-switch": [17050, 124.98866213151771],
  "ui-link-forget-pass": [18550, 199.47845804988518],
  "ui-theme-toggle": [20050, 2475.2607709750587],
};

// ─── Singleton Howl instance shared across all hook consumers ─────────────────
let howlInstance: HowlInstance | null = null;
let isMuted = false;

/**
 * Lazily initialises the Howl singleton on first call.
 * Dynamic import keeps Howler.js out of the SSR bundle.
 */
async function getHowl(): Promise<HowlInstance> {
  if (howlInstance) return howlInstance;

  const { Howl } = (await import("howler")) as unknown as {
    Howl: HowlConstructor;
  };

  howlInstance = new Howl({
    src: [
      "/Audio/Auth/auth-sprite.webm",
      "/Audio/Auth/auth-sprite.m4a",
      "/Audio/Auth/auth-sprite.mp3",
    ],
    sprite: SPRITE_MAP,
    preload: true,
    html5: false,
    volume: 1,
  });

  // Warm up audio context on some browsers by playing a silent sprite.
  // This is scheduled on idle to not block initial paint.
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => {
      howlInstance?.play("silence");
    });
  }

  return howlInstance;
}

// Active sound IDs — used to stop an overlapping play of the same key.
const activeSounds = new Map<string, number>();

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuthSound() {
  const howlRef = useRef<HowlInstance | null>(null);

  // Pre-load the Howl instance as soon as the hook mounts.
  useEffect(() => {
    let cancelled = false;
    getHowl().then((h) => {
      if (!cancelled) howlRef.current = h;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Play a named sprite key.
   * Automatically stops any previous instance of the same key to prevent overlap.
   */
  const play = useCallback((key: AuthSoundKey) => {
    if (isMuted) return;

    getHowl().then((howl) => {
      // Stop the previous sound of the same key if still playing.
      const prev = activeSounds.get(key);
      if (prev !== undefined) {
        howl.stop(prev);
        activeSounds.delete(key);
      }

      const id = howl.play(key);
      activeSounds.set(key, id);
    });
  }, []);

  /**
   * Play a named sprite key and return a Promise that resolves when
   * the sound has finished playing. Safe to await before navigating.
   */
  const playAndWait = useCallback((key: AuthSoundKey): Promise<void> => {
    return new Promise((resolve) => {
      if (isMuted) {
        resolve();
        return;
      }

      getHowl()
        .then((howl) => {
          const prev = activeSounds.get(key);
          if (prev !== undefined) {
            howl.stop(prev);
            activeSounds.delete(key);
          }

          // Use the sprite duration from SPRITE_MAP so we don't rely on Howler's
          // 'end' event (which can be silently swallowed on navigation).
          const sprite = SPRITE_MAP[key];
          const durationMs = sprite ? sprite[1] : 0;

          const id = howl.play(key);
          activeSounds.set(key, id);

          // Resolve after the sprite duration — the sound will have finished.
          setTimeout(() => {
            activeSounds.delete(key);
            resolve();
          }, durationMs);
        })
        .catch(() => resolve());
    });
  }, []);

  /** Mute / unmute all auth sounds globally. */
  const setMuted = useCallback((muted: boolean) => {
    isMuted = muted;
    getHowl().then((howl) => {
      howl.mute(muted);
    });
  }, []);

  /** Set volume (0–1). */
  const setVolume = useCallback((vol: number) => {
    getHowl().then((howl) => {
      howl.volume(Math.max(0, Math.min(1, vol)));
    });
  }, []);

  return { play, playAndWait, setMuted, setVolume };
}
