"use client";

import { useEffect } from "react";
import { sfx, unlockAudio } from "@/lib/sound";

const LEAVES = ["🍃", "🌿", "🍀"];

function spawnLeaf(x: number, y: number) {
    const el = document.createElement("span");
    el.textContent = LEAVES[Math.floor(Math.random() * LEAVES.length)];
    el.className = "leaf-burst";

    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 40;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--dy", `${Math.sin(angle) * dist - 20}px`);
    el.style.setProperty("--rot", `${Math.random() * 360 - 180}deg`);

    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
}

export function ClickEffects() {
    useEffect(() => {
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        function onPointerDown(e: PointerEvent) {
            unlockAudio();

            const target = e.target as HTMLElement | null;
            const el = target?.closest("button, a") as HTMLButtonElement | null;
            if (!el || el.disabled) return;

            sfx.click();
            if (reduceMotion) return;
            for (let i = 0; i < 6; i++) spawnLeaf(e.clientX, e.clientY);
        }

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, []);

    return null;
}