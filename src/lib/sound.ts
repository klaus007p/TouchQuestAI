import { Howl } from "howler";

const KEY = "tq_sound";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;
let enabled = true;
let loaded = false;
let ambientWanted = false;
let synthAmbient: { stop: () => void } | null = null;

// ---------------------------------------------------------------------------
// Sound files
// ---------------------------------------------------------------------------

// One-shot effects. If a file is missing, the synth version plays instead.
const FILES = {
    click: "/sounds/click.mp3",
    chirp: "/sounds/chirp.mp3",
    start: "/sounds/start.mp3",
    success: "/sounds/success.mp3",
} as const;

type EffectName = keyof typeof FILES;

const howls: Partial<Record<EffectName, Howl>> = {};
const failedFiles = new Set<EffectName>();

// Looping background sounds.
export const AMBIENT_TRACKS = {
    birds: { label: "Birds", emoji: "🐦", src: "/sounds/birds.mp3", volume: 0.4 },
    rain: { label: "Rain", emoji: "🌧️", src: "/sounds/rain.mp3", volume: 0.35 },
    crickets: { label: "Crickets", emoji: "🦗", src: "/sounds/crickets.mp3", volume: 0.3 },
    storm: { label: "Storm", emoji: "⛈️", src: "/sounds/storm.mp3", volume: 0.3 },
} as const;

export type AmbientName = keyof typeof AMBIENT_TRACKS;

const ambientHowls: Partial<Record<AmbientName, Howl>> = {};
const ambientFailed = new Set<AmbientName>();
let currentAmbient: AmbientName | null = null;

// ---------------------------------------------------------------------------
// Setup and preference
// ---------------------------------------------------------------------------

function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
        enabled = localStorage.getItem(KEY) !== "off";
    } catch {
        // Storage can be blocked. Default to on.
    }
}

function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!ctx) {
        const Ctor =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
                .webkitAudioContext;
        if (!Ctor) return null;
        ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
}

export function unlockAudio() {
    getCtx();
}

export function isSoundEnabled() {
    load();
    return enabled;
}

// ---------------------------------------------------------------------------
// Synth fallbacks (used when a sound file is missing or fails to load)
// ---------------------------------------------------------------------------

function tone(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    endFreq?: number
) {
    load();
    if (!enabled) return;
    const c = getCtx();
    if (!c) return;

    const t = c.currentTime + start;
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
}

function chirp() {
    const base = 2000 + Math.random() * 600;
    tone(base, 0, 0.08, "sine", 0.05, base * 1.5);
    tone(base * 1.3, 0.11, 0.08, "sine", 0.05, base * 1.1);
    tone(base * 1.2, 0.22, 0.1, "sine", 0.05, base * 1.6);
}

// Synthesized wind plus random bird chirps.
function beginAmbient() {
    const c = getCtx();
    if (!c || synthAmbient) return;

    const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = c.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 500;
    filter.Q.value = 0.6;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, c.currentTime + 2);

    const lfo = c.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain).connect(gain.gain);

    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
    lfo.start();

    let timer: ReturnType<typeof setTimeout>;
    const birdLoop = () => {
        chirp();
        timer = setTimeout(birdLoop, 3000 + Math.random() * 6000);
    };
    timer = setTimeout(birdLoop, 1500);

    synthAmbient = {
        stop: () => {
            clearTimeout(timer);
            lfo.disconnect();
            gain.gain.setTargetAtTime(0, c.currentTime, 0.2);
            setTimeout(() => {
                src.stop();
                lfo.stop();
            }, 900);
        },
    };
}

function killAmbient() {
    synthAmbient?.stop();
    synthAmbient = null;
}

// ---------------------------------------------------------------------------
// One-shot effects (file first, synth fallback)
// ---------------------------------------------------------------------------

function playFile(name: EffectName, fallback: () => void, volume = 0.6) {
    load();
    if (!enabled) return;

    if (failedFiles.has(name)) {
        fallback();
        return;
    }

    let h = howls[name];
    if (!h) {
        h = new Howl({
            src: [FILES[name]],
            volume,
            onloaderror: () => failedFiles.add(name),
        });
        howls[name] = h;
    }
    h.play();
}

// ---------------------------------------------------------------------------
// Looping ambient tracks (file first, synth fallback)
// ---------------------------------------------------------------------------

function fadeOut(h: Howl) {
    h.fade(h.volume(), 0, 600);
    setTimeout(() => {
        if (h.volume() === 0) h.pause();
    }, 700);
}

function stopFileAmbient() {
    for (const h of Object.values(ambientHowls)) {
        if (h) fadeOut(h);
    }
}

// Returns false if this track's file can't be used, so the caller can fall back.
function startFileAmbient(name: AmbientName): boolean {
    if (ambientFailed.has(name)) return false;

    let h = ambientHowls[name];
    if (!h) {
        h = new Howl({
            src: [AMBIENT_TRACKS[name].src],
            loop: true,
            volume: 0,
            onloaderror: () => {
                ambientFailed.add(name);
                if (ambientWanted && enabled && currentAmbient === name) {
                    stopFileAmbient();
                    beginAmbient();
                }
            },
        });
        ambientHowls[name] = h;
    }

    // Crossfade: fade out every other track while this one fades in.
    for (const [other, howl] of Object.entries(ambientHowls)) {
        if (other !== name && howl) fadeOut(howl);
    }

    if (!h.playing()) h.play();
    h.fade(h.volume(), AMBIENT_TRACKS[name].volume, 1500);
    return true;
}

// Starts (or restarts) whichever ambient should be playing right now.
function resumeAmbient() {
    if (!enabled || !ambientWanted || !currentAmbient) return;

    if (startFileAmbient(currentAmbient)) {
        killAmbient();
    } else {
        stopFileAmbient();
        beginAmbient();
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const sfx = {
    click: () =>
        playFile("click", () => tone(520, 0, 0.09, "sine", 0.1, 260), 0.4),

    chirp: () => playFile("chirp", chirp, 0.5),

    start: () =>
        playFile("start", () => {
            chirp();
            tone(392, 0.3, 0.25, "triangle", 0.08);
            tone(523, 0.45, 0.35, "triangle", 0.08);
        }),

    success: () =>
        playFile("success", () => {
            [523, 659, 784, 1047].forEach((f, i) =>
                tone(f, i * 0.12, 0.6, "triangle", 0.1)
            );
        }),

    levelUp: () => {
        [523, 659, 784, 1047, 1319].forEach((f, i) =>
            tone(f, 0.7 + i * 0.1, 0.7, "triangle", 0.1)
        );
    },

    startAmbient: (name: AmbientName) => {
        load();
        ambientWanted = true;
        currentAmbient = name;
        resumeAmbient();
    },

    stopAmbient: () => {
        ambientWanted = false;
        currentAmbient = null;
        killAmbient();
        stopFileAmbient();
    },
};

export function setSoundEnabled(value: boolean) {
    load();
    enabled = value;
    try {
        localStorage.setItem(KEY, value ? "on" : "off");
    } catch {
        // Ignore storage errors.
    }
    if (!value) {
        killAmbient();
        stopFileAmbient();
    } else {
        resumeAmbient();
    }
}