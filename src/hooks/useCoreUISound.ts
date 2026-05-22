'use client';

import { useRef, useCallback, useEffect } from 'react';

// ─── Sprite key type (derived from core-ui-sprite.json) ───────────────────────
export type CoreUISoundKey =
  | 'btn-hero-start'
  | 'btn-primary-action'
  | 'btn-secondary-action'
  | 'card-feature-click'
  | 'chat-msg-receive'
  | 'chat-msg-send'
  | 'quiz-loader-done'
  | 'quiz-result-good'
  | 'quiz-result-perfect'
  | 'quiz-result-retry'
  | 'ui-action-locked'
  | 'ui-checkbox-check'
  | 'ui-dropdown-open'
  | 'ui-error-msg'
  | 'ui-logout'
  | 'ui-menu-toggle'
  | 'ui-nav-click'
  | 'ui-nav-premium'
  | 'ui-text-link'
  | 'ui-theme-toggle';

// ─── Minimal Howl types to avoid importing @types/howler at module level ──────
type HowlInstance = {
  play: (key: string) => number;
  stop: (id?: number) => void;
  volume: (vol?: number) => number | void;
  mute: (muted?: boolean) => boolean | void;
  state: () => 'unloaded' | 'loading' | 'loaded';
};

type HowlConstructorOptions = {
  src: string[];
  sprite: Record<string, [number, number] | [number, number, boolean]>;
  preload: boolean;
  html5?: boolean;
  volume?: number;
};

type HowlConstructor = new (opts: HowlConstructorOptions) => HowlInstance;

// ─── Sprite map exactly matching Audio/Core-ui/core-ui-sprite.json ────────────
const SPRITE_MAP: HowlConstructorOptions['sprite'] = {
  silence:            [0,       50,                    true],
  'btn-hero-start':   [550,     5014.739229024944],
  'btn-primary-action':   [7050,    1301.224489795918],
  'btn-secondary-action': [9549.999999999998,  2000],
  'card-feature-click':   [12049.999999999998, 1106.5759637188214],
  'chat-msg-receive':     [14549.999999999998, 2170.566893424036],
  'chat-msg-send':        [18049.999999999996, 1342.1995464852614],
  'quiz-loader-done':     [20549.999999999996, 1937.4829931972783],
  'quiz-result-good':     [23049.999999999996, 2993.5600907029498],
  'quiz-result-perfect':  [26549.999999999996, 3542.2448979591827],
  'quiz-result-retry':    [31049.999999999996, 3004.1950113378703],
  'ui-action-locked':     [35550,              3341.2925170068065],
  'ui-checkbox-check':    [40050,              500],
  'ui-dropdown-open':     [41550,              509.999999999998],
  'ui-error-msg':         [43050,              1108.7528344671184],
  'ui-logout':            [45550,              1137.777777777778],
  'ui-menu-toggle':       [48050,              301.2018140589561],
  'ui-nav-click':         [49550,              1688.843537414968],
  'ui-nav-premium':       [52050,              3026.984126984125],
  'ui-text-link':         [56550,              124.98866213152127],
  'ui-theme-toggle':      [58050,              2475.260770975055],
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

  const { Howl } = await import('howler') as unknown as { Howl: HowlConstructor };

  howlInstance = new Howl({
    src: [
      '/Audio/Core-ui/core-ui-sprite.webm',
      '/Audio/Core-ui/core-ui-sprite.m4a',
      '/Audio/Core-ui/core-ui-sprite.mp3',
    ],
    sprite: SPRITE_MAP,
    preload: true,
    html5: false,
    volume: 1,
  });

  // Warm up audio context on idle to avoid first-play latency.
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      howlInstance?.play('silence');
    });
  }

  return howlInstance;
}

// Active sound IDs per key — prevents the same sound from stacking on itself.
const activeSounds = new Map<string, number>();

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCoreUISound() {
  const howlRef = useRef<HowlInstance | null>(null);

  // Pre-load the Howl instance as soon as the hook mounts.
  useEffect(() => {
    let cancelled = false;
    getHowl().then((h) => {
      if (!cancelled) howlRef.current = h;
    });
    return () => { cancelled = true; };
  }, []);

  /**
   * Play a named sprite key.
   * Stops any previous overlapping instance of the same key first.
   */
  const play = useCallback((key: CoreUISoundKey) => {
    if (isMuted) return;

    getHowl().then((howl) => {
      const prev = activeSounds.get(key);
      if (prev !== undefined) {
        howl.stop(prev);
        activeSounds.delete(key);
      }

      const id = howl.play(key);
      activeSounds.set(key, id);
    });
  }, []);

  /** Mute / unmute all Core-UI sounds globally. */
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

  return { play, setMuted, setVolume };
}
