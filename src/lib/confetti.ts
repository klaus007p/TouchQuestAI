import confetti from "canvas-confetti";

const COLORS = ["#34d399", "#a3e635", "#fde68a", "#86efac", "#6ee7b7"];

export function celebrate(big: boolean) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    confetti({
        particleCount: big ? 160 : 70,
        spread: big ? 100 : 70,
        origin: { y: 0.6 },
        colors: COLORS,
    });

    if (big) {
        setTimeout(() => {
            confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: COLORS });
            confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: COLORS });
        }, 250);
    }
}