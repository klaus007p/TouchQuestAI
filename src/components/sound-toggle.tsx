
"use client";

import { useState } from "react";
import { isSoundEnabled, setSoundEnabled, sfx } from "@/lib/sound";

export function SoundToggle() {
    const [on, setOn] = useState(() => isSoundEnabled());

    function toggle() {
        const next = !on;
        setOn(next);
        setSoundEnabled(next);

        if (next) sfx.chirp();
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={on}
            aria-label={on ? "Mute nature sounds" : "Unmute nature sounds"}
            title={on ? "Mute sounds" : "Unmute sounds"}
            className="rounded-full border border-white/15 px-2.5 py-1 text-sm transition hover:border-white/30"
        >
            {on ? "🔊" : "🔇"}
        </button>
    );
}
