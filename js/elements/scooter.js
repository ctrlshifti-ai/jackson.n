// A matte-grey step-through scooter, side view. Drawn at double resolution
// (each art pixel is half a normal one) for extra detail. Faces right unless
// told otherwise. Give it the rider's pixel art and a character can ride it:
// the parked scooter disappears and the character is drawn riding it, with
// exhaust smoke while moving.
//
//   const scooter = new Scooter({ scale: 1.5, riderArt: HERO_ART });
//   scooter.placeAt(x, groundY);   // groundY: where the wheels touch the ground
//   floor.addForeground(scooter);  // or addScenery() to draw it behind the hero
//   hero.mount(scooter);           // see Character.mount()
import { makeImage, mirror, pixelArt } from '../engine/pixels.js';
import { drawPixelArt } from '../engine/draw.js';

const DETAIL = 2;     // art pixels per normal pixel
const WIDTH = 92;     // in art pixels
const HEIGHT = 60;

const C = {
    body: '#5a5c64',
    bodyLight: '#7a7c86',
    bodyLighter: '#9294a0',
    bodyDark: '#3a3c42',
    shadow: '#2a2a30',
    accent: '#a8aab4',
    seat: '#1a1a20',
    seatLight: '#3a3a40',
    stitch: '#55555e',
    tire: '#16161a',
    tread: '#2c2c32',
    rim: '#24242a',
    chrome: '#c8ccd4',
    disc: '#8a909a',
    engine: '#4a4c54',
    headlight: '#eef2f6',
    reflector: '#b8c0cc',
    indicator: '#e88a2a',
    tailLight: '#c83030',
    tailLightShine: '#f07070'
};

/* ---------- Drawing helpers (shapes are snapped to hard pixels afterwards) ---------- */

function poly(g, color, points) {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => g.lineTo(x, y));
    g.closePath();
    g.fill();
}

function line(g, color, width, x0, y0, x1, y1) {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
}

function circle(g, color, cx, cy, r) {
    g.fillStyle = color;
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fill();
}

function ring(g, color, width, cx, cy, r, from = 0, to = Math.PI * 2) {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.beginPath();
    g.arc(cx, cy, r, from, to);
    g.stroke();
}

// Make every pixel fully solid or fully clear, so edges stay pixel-art crisp.
function hardEdges(g, width = WIDTH, height = HEIGHT) {
    const pixels = g.getImageData(0, 0, width, height);
    for (let i = 3; i < pixels.data.length; i += 4) pixels.data[i] = pixels.data[i] >= 128 ? 255 : 0;
    g.putImageData(pixels, 0, 0);
}

function wheel(g, cx, cy, alloy) {
    circle(g, C.tire, cx, cy, 10);
    ring(g, C.tread, 1, cx, cy, 9, Math.PI * 1.1, Math.PI * 1.9);   // light catching the tread
    circle(g, C.rim, cx, cy, 7);
    if (alloy) {
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            line(g, C.chrome, 1.2, cx, cy, cx + Math.cos(a) * 6.5, cy + Math.sin(a) * 6.5);
        }
        ring(g, C.disc, 1.4, cx, cy, 4.5);                         // brake disc
    }
    circle(g, C.chrome, cx, cy, 1.8);
}

/* ---------- The scooter, facing left ---------- */

function paintScooter(g, { kickstand = true } = {}) {
    // Rear wheel, mostly behind the body
    wheel(g, 74, 49, false);

    // Exhaust with a heat shield and chrome tip
    poly(g, C.shadow, [[60, 46], [86, 46], [88, 49], [86, 52], [60, 52]]);
    poly(g, C.engine, [[62, 46], [84, 46], [84, 48], [62, 48]]);
    poly(g, C.chrome, [[86, 47], [89, 47], [89, 51], [86, 51]]);

    // Engine casing under the seat
    poly(g, C.shadow, [[48, 40], [64, 42], [64, 47], [48, 46]]);
    poly(g, C.engine, [[54, 42], [72, 42], [74, 47], [56, 48]]);
    line(g, C.bodyDark, 1, 58, 44, 70, 44);

    // Rear body: grey panels with a lighter top and darker belly
    poly(g, C.body, [[46, 24], [88, 22], [91, 27], [90, 33], [84, 38], [76, 41], [60, 42], [50, 40], [45, 32]]);
    poly(g, C.bodyLight, [[47, 24], [88, 22], [90, 25], [48, 27]]);
    poly(g, C.bodyDark, [[50, 38], [84, 36], [76, 41], [60, 42], [50, 40]]);
    poly(g, C.accent, [[54, 37], [88, 27], [89, 29], [56, 39]]);          // silver stripe
    line(g, C.bodyDark, 1, 62, 26, 60, 38);                                // panel line
    poly(g, C.tailLight, [[88, 23], [91, 25], [91, 30], [88, 30]]);
    poly(g, C.tailLightShine, [[89, 24], [90, 25], [90, 26], [89, 26]]);

    // Seat with stitching, and the grab rail behind it
    poly(g, C.seat, [[48, 18], [56, 15], [82, 15], [90, 18], [89, 23], [48, 24]]);
    line(g, C.seatLight, 1, 56, 16, 82, 16);
    for (let x = 52; x < 86; x += 3) line(g, C.stitch, 0.8, x, 20, x + 1, 20);
    line(g, C.bodyDark, 2, 82, 21, 91, 22);

    // Floorboard with a ribbed rubber mat
    poly(g, C.bodyDark, [[26, 40], [52, 40], [52, 45], [28, 46]]);
    for (let x = 30; x < 50; x += 3) line(g, C.engine, 1, x, 41, x, 44);

    // Leg shield joining the front to the floorboard
    poly(g, C.body, [[28, 26], [37, 24], [38, 42], [28, 44]]);
    poly(g, C.bodyDark, [[34, 26], [37, 24], [38, 42], [35, 42]]);

    // Front wheel, fork and fender
    wheel(g, 17, 49, true);
    line(g, C.bodyDark, 3, 18, 48, 25, 31);
    line(g, C.chrome, 1, 21, 41, 24, 33);
    poly(g, C.body, [[6, 37], [10, 34], [27, 34], [29, 37], [27, 39], [8, 39]]);
    line(g, C.bodyLighter, 1, 10, 35, 26, 35);

    // Front apron (the nose), with light facets on top
    poly(g, C.body, [[22, 14], [35, 12], [34, 30], [32, 40], [26, 42], [18, 36], [9, 30], [8, 24], [12, 18]]);
    poly(g, C.bodyLight, [[12, 18], [22, 14], [34, 13], [30, 17], [16, 21]]);
    poly(g, C.bodyDark, [[26, 34], [32, 30], [32, 40], [26, 42]]);
    line(g, C.accent, 1.2, 24, 18, 29, 31);                                 // silver accent

    // Headlight with reflector and running-light strip, indicator below
    poly(g, C.shadow, [[8, 22], [19, 18], [21, 22], [9, 28]]);
    poly(g, C.headlight, [[9, 22], [18, 19], [20, 22], [10, 27]]);
    poly(g, C.reflector, [[12, 22], [17, 20], [18, 22], [13, 24]]);
    line(g, C.headlight, 1, 11, 29, 19, 26);
    poly(g, C.indicator, [[13, 30], [18, 28], [19, 30], [14, 31]]);

    // Handlebar cover with a badge, grip, brake lever and mirror
    poly(g, C.body, [[22, 8], [36, 7], [40, 10], [37, 13], [22, 14]]);
    line(g, C.bodyLighter, 1, 23, 8, 36, 8);
    poly(g, C.chrome, [[27, 10], [31, 10], [31, 11], [27, 11]]);
    poly(g, C.seat, [[38, 10], [43, 10], [43, 13], [38, 13]]);
    line(g, C.chrome, 1, 38, 9, 44, 7);
    line(g, C.bodyDark, 1, 30, 7, 27, 2);
    g.fillStyle = C.seat;
    g.beginPath();
    g.ellipse(26, 2, 4, 2, -0.2, 0, Math.PI * 2);
    g.fill();
    line(g, C.bodyLight, 1, 24, 1, 27, 1);

    // Kickstand down to the ground (only when parked)
    if (kickstand) {
        line(g, C.bodyDark, 2, 42, 46, 38, 58);
        poly(g, C.bodyDark, [[35, 58], [40, 58], [40, 60], [35, 60]]);
    }

    hardEdges(g);
}

const FACING_LEFT = makeImage(WIDTH, HEIGHT, paintScooter);
const FACING_RIGHT = mirror(FACING_LEFT);
const RIDING_RIGHT = mirror(makeImage(WIDTH, HEIGHT, g => paintScooter(g, { kickstand: false })));

/* ---------- Someone riding it (facing right; mirrored for left) ---------- */

const RIDER_ROOM = 50; // extra art pixels above the scooter for the rider's body

// The side pose's upper body without its hanging hand (painted over with
// shirt, or jeans on the last row), using art.sideHand to find it.
function withoutHangingHand(art) {
    const hand = art.sideHand;
    if (!hand) return art.side;
    return art.side.map((row, y) => {
        if (y < hand.fromRow || y > hand.toRow) return row;
        return [...row].map((char, x) => {
            const inHand = x >= hand.fromCol && x <= hand.toCol && hand.skin.includes(char);
            if (!inHand) return char;
            return y === hand.toRow ? hand.coverBelt : hand.cover;
        }).join('');
    });
}

// The rider's side-view upper body sitting on the seat, legs bent onto the
// floorboard, the near arm bent at the elbow to the handlebar. `art` is character pixel
// art (see hero-art.js); its pixels are drawn 2x2 to match the scooter's detail.
function paintRider(g, art) {
    const c = art.colors;
    const top = RIDER_ROOM;
    g.drawImage(RIDING_RIGHT, 0, top); // kickstand up while riding

    // Upper body, hips sunk into the seat
    g.drawImage(pixelArt(withoutHangingHand(art), c, DETAIL), 17, 0);

    // Thigh along the seat, shin down to the floorboard, shoe on it
    poly(g, c.G, [[24, top + 12], [50, top + 12], [54, top + 16], [52, top + 22], [24, top + 22]]);
    poly(g, c.F, [[24, top + 18], [52, top + 18], [52, top + 22], [24, top + 22]]);
    poly(g, c.F, [[46, top + 16], [54, top + 16], [56, top + 38], [48, top + 38]]);
    line(g, c.G, 2, 48, top + 18, 50, top + 36);
    poly(g, c.L, [[46, top + 36], [60, top + 36], [62, top + 40], [46, top + 41]]);
    poly(g, c.K, [[46, top + 40], [62, top + 40], [62, top + 42], [46, top + 42]]);

    // Near arm (the one facing the viewer), bent at the elbow: the upper arm
    // hangs down in its sleeve as in the side pose; from the elbow the
    // forearm angles forward to the grip.
    // The forearm tapers like a cone: thick at the elbow, narrower at the wrist.
    const elbow = { x: 35, y: 49 }, grip = { x: 52, y: 60 };
    const elbowHalf = 3.5, wristHalf = 2.2;                                   // half-thickness, in art pixels
    const dx = grip.x - elbow.x, dy = grip.y - elbow.y, len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len;                                     // across the arm
    circle(g, c.J, elbow.x, elbow.y, elbowHalf);
    poly(g, c.J, [
        [elbow.x + nx * elbowHalf, elbow.y + ny * elbowHalf],
        [grip.x + nx * wristHalf, grip.y + ny * wristHalf],
        [grip.x - nx * wristHalf, grip.y - ny * wristHalf],
        [elbow.x - nx * elbowHalf, elbow.y - ny * elbowHalf]
    ]);
    poly(g, c.H, [                                                           // shadow along the underside
        [elbow.x + nx * elbowHalf, elbow.y + ny * elbowHalf],
        [grip.x + nx * wristHalf, grip.y + ny * wristHalf],
        [grip.x + nx * (wristHalf - 1), grip.y + ny * (wristHalf - 1)],
        [elbow.x + nx * (elbowHalf - 1.2), elbow.y + ny * (elbowHalf - 1.2)]
    ]);
    circle(g, c.J, grip.x + 0.5, grip.y + 0.5, 3);                           // hand on the grip

    hardEdges(g, WIDTH, HEIGHT + RIDER_ROOM);
}

// Where the exhaust tip is in the rider picture (facing right), in art pixels
const EXHAUST = { x: 3, y: RIDER_ROOM + 49 };
const SMOKE_COLORS = ['#e4e8ee', '#c8ccd4', '#9aa0aa'];

export class Scooter {
    // scale: game pixels per normal art pixel (match the character's scale).
    // riderArt: pixel art of whoever rides it (needed for ride()).
    constructor({ scale = 1, facing = 'right', riderArt = null, speedBoost = 2 } = {}) {
        this.drawScale = scale / DETAIL;
        this.image = facing === 'left' ? FACING_LEFT : FACING_RIGHT;
        this.width = WIDTH * this.drawScale;
        this.height = HEIGHT * this.drawScale;
        this.speedBoost = speedBoost; // how much faster the rider goes
        this.x = 0;
        this.groundY = 0;
        this.ridden = false;
        if (riderArt) {
            const right = makeImage(WIDTH, HEIGHT + RIDER_ROOM, g => paintRider(g, riderArt));
            this.riderImages = { right, left: mirror(right) };
        }
    }

    placeAt(x, groundY) {
        this.x = x;
        this.groundY = groundY;
    }

    get centerX() {
        return this.x + this.width / 2;
    }

    // Parked: drawn on its own. Ridden: the rider draws it (see drawWithRider).
    draw(ctx, camera) {
        if (this.ridden) return;
        drawPixelArt(ctx, this.image, this.x - camera.left, this.groundY - this.height - camera.top, this.drawScale);
    }

    // Draw the scooter with `rider` on it, centered on the rider, wheels on the road.
    drawWithRider(ctx, camera, rider) {
        const image = rider.facing === 'left' ? this.riderImages.left : this.riderImages.right;
        const s = this.drawScale;
        const x = rider.centerX - (image.width * s) / 2 - camera.left;
        const y = this.groundY - image.height * s - camera.top;
        drawPixelArt(ctx, image, x, y, s);
        if (rider.walking) this.drawSmoke(ctx, x, y, image.width, rider.facing, rider.walkTime);
    }

    // Three little puffs drifting back from the exhaust, growing and fading.
    drawSmoke(ctx, x, y, imageWidth, facing, time) {
        const s = this.drawScale;
        const back = facing === 'left' ? 1 : -1;
        const tipX = facing === 'left' ? imageWidth - EXHAUST.x : EXHAUST.x;
        for (let i = 0; i < 3; i++) {
            const age = (time * 2.5 + i / 3) % 1;          // 0 = just out, 1 = gone
            const step = Math.min(2, Math.floor(age * 3));  // NES-style: size jumps in steps
            const size = (step + 2) * 2;                    // 4, 6 or 8 art pixels
            const px = tipX + back * (4 + age * 18) - size / 2;
            const py = EXHAUST.y - age * 8 - size / 2;
            ctx.fillStyle = SMOKE_COLORS[step];
            ctx.fillRect(Math.round(x + px * s), Math.round(y + py * s), Math.ceil(size * s), Math.ceil(size * s));
        }
    }
}
