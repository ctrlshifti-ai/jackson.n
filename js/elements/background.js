// Pixel-art night city behind everything. The still parts (sky, stars,
// clouds, buildings) are painted once into an image. The red rooftop
// lights and the brightest stars are drawn every frame so they can pulse.
// The whole thing scrolls slower than the world so it feels far away.
import { makeImage } from '../engine/pixels.js';
import { drawPixelArt, drawDot } from '../engine/draw.js';
import { seededRandom, breathe } from '../engine/math.js';

// Sky colors from the top of the sky down to the sunset glow.
const SKY = [
    '#0a0820', '#120f38', '#1a1650', '#251d6c', '#3a2584',
    '#58308f', '#7e3a94', '#ad4a9c', '#e070b0', '#f8a8d0'
];

const COLORS = {
    star: '#fcfcfc',
    starDim: '#a8a0e0',
    cloud: '#1c1640',
    cloudEdge: '#6a3a8a',
    farBuilding: '#2a2058',
    farWindow: '#5a4a90',
    building: '#0d0a1f',
    buildingEdge: '#3a2a60',
    windowDark: '#1a1538',
    windowLit: ['#f8d878', '#fcbcb0', '#f878b8'],
    redLight: '#f83800'
};

// 4x4 pattern used to blend between sky colors in a checkered, NES-like way.
const DITHER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export class CityBackground {
    constructor({ parallax = 0.3, seed = 279 } = {}) {
        this.parallax = parallax; // 0 = never moves, 1 = moves with the world
        this.seed = seed;         // change for a different city layout
        this.image = null;
        this.lights = [];         // red lights that pulse: { x, y, delay }
        this.twinkles = [];       // bright stars that twinkle: { x, y, delay }
        this.time = 0;
    }

    // Paint the background for the current screen size.
    build(viewWidth, viewHeight, worldWidth) {
        const width = viewWidth + Math.ceil((worldWidth - viewWidth) * this.parallax);
        const height = viewHeight;
        this.lights = [];
        this.twinkles = [];

        this.image = makeImage(width, height, g => {
            const scene = {
                g,
                width,
                height,
                horizon: height, // buildings stand on the bottom edge
                centerX: Math.round(width / 2),
                random: seededRandom(this.seed),
                lights: this.lights,
                twinkles: this.twinkles
            };
            paintSky(scene);
            paintStars(scene);
            paintClouds(scene);
            paintFarBuildings(scene);
            paintNearBuildings(scene);
        });
    }

    update(dt) {
        this.time += dt;
    }

    draw(ctx, camera) {
        const offsetX = -Math.round(camera.x * this.parallax);
        drawPixelArt(ctx, this.image, offsetX, 0);
        this.drawLights(ctx, offsetX);
        this.drawTwinkles(ctx, offsetX);
    }

    // Red lights slowly glow brighter and dimmer, with a soft halo at their brightest.
    drawLights(ctx, offsetX) {
        this.lights.forEach(light => {
            const glow = breathe(this.time + light.delay, 2.5);
            const x = light.x + offsetX;
            drawDot(ctx, x, light.y, COLORS.redLight, 0.35 + 0.65 * glow);
            if (glow > 0.6) {
                const halo = (glow - 0.6) * 0.8;
                drawDot(ctx, x - 1, light.y, COLORS.redLight, halo);
                drawDot(ctx, x + 1, light.y, COLORS.redLight, halo);
                drawDot(ctx, x, light.y - 1, COLORS.redLight, halo);
            }
        });
    }

    // Bright stars grow and shrink their little "+" arms.
    drawTwinkles(ctx, offsetX) {
        this.twinkles.forEach(star => {
            const shine = breathe(this.time + star.delay, 3);
            const x = star.x + offsetX;
            drawDot(ctx, x - 1, star.y, COLORS.starDim, shine);
            drawDot(ctx, x + 1, star.y, COLORS.starDim, shine);
            drawDot(ctx, x, star.y - 1, COLORS.starDim, shine);
            drawDot(ctx, x, star.y + 1, COLORS.starDim, shine);
        });
    }
}

/* ---------- Painting steps ---------- */

function dot(g, x, y, color) {
    g.fillStyle = color;
    g.fillRect(x, y, 1, 1);
}

function between(random, min, max) {
    return min + random() * (max - min);
}

function paintSky({ g, width, horizon, centerX }) {
    const colors = SKY.map(hex => {
        const n = parseInt(hex.slice(1), 16);
        return [n >> 16 & 255, n >> 8 & 255, n & 255];
    });
    const pixels = g.createImageData(width, horizon);

    for (let y = 0; y < horizon; y++) {
        const depth = y / horizon; // 0 at the top, 1 at the horizon
        for (let x = 0; x < width; x++) {
            // Pink glow around the sunset point, plus a thin beam of light above it
            const dx = (x - centerX) / (width * 0.35 + 40);
            const dy = (y - horizon) / (horizon * 0.9);
            const glow = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
            const beam = Math.max(0, 1 - Math.abs(x - centerX) / (width * 0.03 + 4)) * depth * 0.35;
            const brightness = Math.min(1, depth * 0.62 + glow * glow * 0.6 + beam);

            const dither = DITHER[(y % 4) * 4 + (x % 4)] / 16 - 0.5;
            const index = Math.round(brightness * (SKY.length - 1) + dither);
            const [r, gr, b] = colors[Math.max(0, Math.min(SKY.length - 1, index))];

            const i = (y * width + x) * 4;
            pixels.data[i] = r;
            pixels.data[i + 1] = gr;
            pixels.data[i + 2] = b;
            pixels.data[i + 3] = 255;
        }
    }
    g.putImageData(pixels, 0, 0);
}

function paintStars({ g, width, horizon, random, twinkles }) {
    const count = Math.round(width * horizon / 260);
    for (let i = 0; i < count; i++) {
        const x = Math.floor(random() * width);
        const y = Math.floor(Math.pow(random(), 1.6) * horizon * 0.6); // more stars higher up
        if (random() < 0.08) {
            // A bright star; its twinkling arms are drawn every frame
            dot(g, x, y, COLORS.star);
            twinkles.push({ x, y, delay: random() * 3 });
        } else {
            dot(g, x, y, random() < 0.5 ? COLORS.star : COLORS.starDim);
        }
    }
}

function paintClouds({ g, width, horizon, random }) {
    const count = Math.max(3, Math.round(width / 70));
    for (let c = 0; c < count; c++) {
        const cx = random() * width;
        const cy = between(random, 0.08, 0.5) * horizon;

        // Each cloud is a bunch of overlapping squashed circles
        const puffs = [];
        const puffCount = 4 + Math.floor(random() * 4);
        for (let p = 0; p < puffCount; p++) {
            puffs.push({
                x: cx + between(random, -24, 24),
                y: cy + between(random, -5, 5),
                r: between(random, 5, 13)
            });
        }
        const isCloud = (x, y) => puffs.some(p => {
            const dx = x - p.x;
            const dy = (y - p.y) * 1.6;
            return dx * dx + dy * dy < p.r * p.r;
        });

        for (let y = Math.floor(cy - 20); y < cy + 20; y++) {
            for (let x = Math.floor(cx - 40); x < cx + 40; x++) {
                if (x < 0 || x >= width || y < 0 || !isCloud(x, y)) continue;
                // Pink edge along the underside, where the sunset hits it
                dot(g, x, y, isCloud(x, y + 2) ? COLORS.cloud : COLORS.cloudEdge);
            }
        }
    }
}

function paintFarBuildings({ g, width, horizon, random }) {
    for (let x = -4; x < width;) {
        const w = Math.round(between(random, 8, 20));
        const h = Math.round(horizon * between(random, 0.18, 0.42));
        const top = horizon - h;

        g.fillStyle = COLORS.farBuilding;
        g.fillRect(x, top, w, h);
        for (let wy = top + 3; wy < horizon - 2; wy += 4) {
            for (let wx = x + 2; wx < x + w - 1; wx += 3) {
                if (random() < 0.1) dot(g, wx, wy, COLORS.farWindow);
            }
        }
        x += w + Math.round(between(random, 0, 6));
    }
}

function paintNearBuildings({ g, width, horizon, centerX, random, lights }) {
    for (let x = Math.round(between(random, -10, 0)); x < width;) {
        const w = Math.round(between(random, 14, 30));
        // Buildings get shorter toward the middle so the sunset shows through
        const awayFromCenter = Math.min(1, Math.abs(x + w / 2 - centerX) / (width * 0.3 + 20));
        const h = Math.round(horizon * between(random, 0.3, 0.72) * (0.45 + 0.55 * awayFromCenter));
        const top = horizon - h;

        g.fillStyle = COLORS.building;
        g.fillRect(x, top, w, h);

        // Lit edge on the side facing the sunset
        g.fillStyle = COLORS.buildingEdge;
        g.fillRect(x + w / 2 < centerX ? x + w - 1 : x, top, 1, h);

        paintWindows(g, x, top, w, horizon, random);
        paintRoof(g, x, top, w, random, lights);

        x += w + Math.round(between(random, 3, 22));
    }
}

function paintWindows(g, x, top, w, bottom, random) {
    for (let wy = top + 3; wy < bottom - 3; wy += 3) {
        for (let wx = x + 2; wx < x + w - 2; wx += 3) {
            const roll = random();
            if (roll < 0.1) {
                g.fillStyle = COLORS.windowLit[Math.floor(random() * COLORS.windowLit.length)];
                g.fillRect(wx, wy, 2, 1);
            } else if (roll < 0.55) {
                g.fillStyle = COLORS.windowDark;
                g.fillRect(wx, wy, 2, 1);
            }
        }
    }
}

function paintRoof(g, x, top, w, random, lights) {
    // Red lights on the corners (drawn every frame, see drawLights)
    lights.push({ x: x + 1, y: top - 1, delay: random() * 2.5 });
    lights.push({ x: x + w - 2, y: top - 1, delay: random() * 2.5 });

    // Sometimes an antenna with a red light on top
    if (random() < 0.6) {
        const antennaX = x + Math.round(between(random, 3, w - 4));
        const antennaHeight = Math.round(between(random, 5, 16));
        g.fillStyle = COLORS.building;
        g.fillRect(antennaX, top - antennaHeight, 1, antennaHeight);
        lights.push({ x: antennaX, y: top - antennaHeight - 1, delay: random() * 2.5 });
    }
}
