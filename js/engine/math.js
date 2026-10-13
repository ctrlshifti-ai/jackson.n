// Keep a number between a minimum and a maximum.
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Smoothly goes 0 -> 1 -> 0 once every `seconds`. Use it for breathing,
// glowing and pulsing effects.
export function breathe(time, seconds = 2) {
    return 0.5 - 0.5 * Math.cos((time / seconds) * Math.PI * 2);
}

// A random number generator that always gives the same sequence for the same seed.
export function seededRandom(seed) {
    return function () {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
