const KEY = "tq_sound";

let ctx: AudioContext | null = null;
let enabled = true;
let loaded = false;
let ambientWanted = false;
let ambient: { stop: () => void } | null = null;

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



function beginAmbient() {
    const c = getCtx();
    if (!c || ambient) return;

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

    ambient = {
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
    ambient?.stop();
    ambient = null;
}



function chirp() {
    const base = 2000 + Math.random() * 600;
    tone(base, 0, 0.08, "sine", 0.05, base * 1.5);
    tone(base * 1.3, 0.11, 0.08, "sine", 0.05, base * 1.1);
    tone(base * 1.2, 0.22, 0.1, "sine", 0.05, base * 1.6);
}

export const sfx = {
    click: () => tone(520, 0, 0.09, "sine", 0.1, 260),
    chirp,
    start: () => {
        chirp();
        tone(392, 0.3, 0.25, "triangle", 0.08);
        tone(523, 0.45, 0.35, "triangle", 0.08);
    },
    success: () => {
        [523, 659, 784, 1047].forEach((f, i) =>
            tone(f, i * 0.12, 0.6, "triangle", 0.1)
        );
    },
    startAmbient: () => {
        load();
        ambientWanted = true;
        if (enabled) beginAmbient();
    },
    stopAmbient: () => {
        ambientWanted = false;
        killAmbient();
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
    if (!value) killAmbient();
    else if (ambientWanted) beginAmbient();
}