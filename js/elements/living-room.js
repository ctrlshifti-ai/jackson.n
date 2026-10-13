// A pixel-art living room that fills a floor: ceiling along the top with a
// hanging lamp, wall, wooden floor, and furniture spread across the floor's
// width. The bare wall above the decorations is left free for content
// (see `emptyWall`).
// Furniture keeps clear of the floor's doors; on narrow screens the least
// important pieces are left out (see FURNITURE below).
//
//   const room = new LivingRoom({ scale: 1.5 });
//   room.placeOn(floor);      // after the floor's doors are added
//   floor.addScenery(room);
//   floor.showGround = false; // the room draws its own floor
import { makeImage } from '../engine/pixels.js';
import { drawPixelArt } from '../engine/draw.js';
import { seededRandom } from '../engine/math.js';

const CEILING_Y = 6;      // the ceiling sits at the very top of the floor
const DECOR_HEIGHT = 100; // pictures, window and shelves hang from this far above the floor
const PENDANT_CORD = 6;    // how far the lamp over the sofa hangs below the ceiling
const DOOR_CLEARANCE = 6; // space kept free on each side of a door, in art pixels

const C = {
    ceiling: '#26222e',
    trim: '#7a4e38',
    trimDark: '#4a3028',
    wall: '#786a6e',
    wallShade: '#6a5e62',
    baseboard: '#4a3228',
    baseboardTop: '#6a4836',
    plankLight: '#c07a4a',
    plank: '#8e5232',
    plankSeam: '#6a3a24',
    floorEdge: '#3a2014',
    trimFront: '#a85e38',
    trimFrontLight: '#c8784a',
    trimFrontJoint: '#5a3020',
    wood: '#8a5432',
    woodLight: '#b06e40',
    woodDark: '#4a2c1c',
    shelfInside: '#2e1e18',
    navy: '#2a2f5a',
    navyLight: '#3a417a',
    navyDark: '#1a1d3a',
    cushion: '#c8bcae',
    rug: '#4a4e78',
    rugEdge: '#3a3c60',
    curtain: '#2c3c6c',
    curtainLight: '#3c5088',
    curtainDark: '#1c2848',
    sky: ['#4a3e8a', '#6a4a9a', '#a85a8a', '#e07a6a'],
    city: '#2c2a5a',
    cityWindow: '#8a8ac8',
    black: '#141420',
    tvFrame: '#2a2a38',
    speaker: '#2a2a34',
    speakerCone: '#4a4a58',
    leaf: '#2e7a3a',
    leafLight: '#4aa04a',
    pot: '#d8d4cc',
    potShade: '#a8a49c',
    frame: '#1e1a1c',
    mat: '#d8d0c8',
    lampShade: '#e8d8b0',
    lampGlow: '#f8ecc8',
    pole: '#3a3a44',
    pendant: '#2a2c48',
    pendantLight: '#f8d8a0',
    red: '#c83c3c',
    books: ['#c84c4c', '#4c7cc8', '#e8b84c', '#4ca86c', '#8a5cb8']
};

function rect(g, color, x, y, w, h) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), w, h);
}

/* ---------- The room itself ---------- */

function paintShell(g, width, height, floorY, ceilingY) {
    // Ceiling and crown trim
    rect(g, C.ceiling, 0, 0, width, ceilingY - 2);
    rect(g, C.trim, 0, ceilingY - 2, width, 1);
    rect(g, C.trimDark, 0, ceilingY - 1, width, 1);

    // Wall, a little darker just under the ceiling
    rect(g, C.wall, 0, ceilingY, width, floorY - ceilingY);
    rect(g, C.wallShade, 0, ceilingY, width, 2);

    // Baseboard
    rect(g, C.baseboardTop, 0, floorY - 3, width, 1);
    rect(g, C.baseboard, 0, floorY - 2, width, 2);

    paintWoodFloor(g, width, height, floorY);
}

// Wooden planks on top, then the orange trim along the front edge.
function paintWoodFloor(g, width, height, floorY) {
    rect(g, C.plankLight, 0, floorY, width, 1);
    rect(g, C.plank, 0, floorY + 1, width, 5);
    rect(g, C.plankSeam, 0, floorY + 3, width, 1);
    for (let x = 0; x < width; x += 16) {
        rect(g, C.plankSeam, x, floorY + 1, 1, 2);      // staggered plank ends
        rect(g, C.plankSeam, x + 8, floorY + 4, 1, 2);
    }
    rect(g, C.floorEdge, 0, floorY + 6, width, 1);

    rect(g, C.trimFront, 0, floorY + 7, width, height - floorY - 7);
    rect(g, C.trimFrontLight, 0, floorY + 7, width, 1);
    for (let x = 0; x < width; x += 8) {
        rect(g, C.trimFrontJoint, x, floorY + 8, 1, height - floorY - 8);
    }
}

/* ---------- Furniture (each painted at x, standing on floorY) ---------- */

function paintBookshelf(g, x, floorY, wallTop, random) {
    const w = 22, h = 34, top = floorY - h;
    rect(g, C.wood, x, top, w, h);
    rect(g, C.woodLight, x, top, w, 1);
    rect(g, C.shelfInside, x + 2, top + 2, w - 4, h - 4);
    for (let shelf = 0; shelf < 3; shelf++) {
        const shelfBottom = top + 2 + (shelf + 1) * 10;
        rect(g, C.wood, x + 2, shelfBottom, w - 4, 1);
        for (let bx = x + 3; bx < x + w - 4; bx += 2 + Math.floor(random() * 2)) {
            const bookHeight = 5 + Math.floor(random() * 3);
            rect(g, C.books[Math.floor(random() * C.books.length)], bx, shelfBottom - bookHeight, 2, bookHeight);
        }
    }
}

function paintFramedPicture(g, x, y, w, h, paintInside) {
    rect(g, C.frame, x, y, w, h);
    rect(g, C.mat, x + 1, y + 1, w - 2, h - 2);
    paintInside(x + 3, y + 3, w - 6, h - 6);
}

function paintPlant(g, x, floorY, wallTop) {
    // Mountain picture on the wall above
    paintFramedPicture(g, x - 1, wallTop + 18, 16, 20, (ix, iy, iw, ih) => {
        rect(g, '#3a5a9c', ix, iy, iw, ih);
        for (let row = 0; row < ih - 3; row++) {
            const half = Math.min(Math.floor(row / 1.6), Math.floor(iw / 2));
            rect(g, row < 3 ? '#e8e8f0' : '#2a3a6a', ix + iw / 2 - half, iy + 2 + row, half * 2 + 1, 1);
        }
    });

    // Pot and leaves
    rect(g, C.pot, x + 3, floorY - 7, 8, 7);
    rect(g, C.potShade, x + 9, floorY - 7, 2, 7);
    const leaves = [[6, 16], [3, 13], [9, 13], [2, 10], [10, 10], [6, 11]];
    leaves.forEach(([lx, ly]) => {
        rect(g, C.leaf, x + lx - 1, floorY - ly - 1, 3, 3);
        rect(g, C.leafLight, x + lx, floorY - ly - 2, 1, 2);
    });
    rect(g, C.leaf, x + 6, floorY - 14, 1, 7); // stem
}

function paintSofa(g, x, floorY, wallTop, random, ceilingY) {
    const w = 56;

    // City-at-sunset picture and a small cat picture above the sofa
    paintFramedPicture(g, x + 8, wallTop + 22, 30, 20, (ix, iy, iw, ih) => {
        C.sky.forEach((color, i) => rect(g, color, ix, iy + i * ih / 4, iw, Math.ceil(ih / 4)));
        [[0, 6], [4, 9], [8, 5], [11, 10], [16, 7], [20, 11]].forEach(([bx, bh]) => {
            rect(g, C.city, ix + bx, iy + ih - bh, 4, bh);
        });
    });
    paintFramedPicture(g, x + 42, wallTop + 26, 11, 13, (ix, iy, iw, ih) => {
        rect(g, C.black, ix + 1, iy + 2, iw - 2, ih - 3); // cat
        rect(g, C.black, ix + 1, iy + 1, 1, 1);           // ears
        rect(g, C.black, ix + iw - 2, iy + 1, 1, 1);
        rect(g, C.leafLight, ix + 2, iy + 3, 1, 1);       // eyes
        rect(g, C.leafLight, ix + iw - 3, iy + 3, 1, 1);
    });

    // Rug on the floor
    rect(g, C.rugEdge, x - 2, floorY + 1, w + 4, 3);
    rect(g, C.rug, x - 1, floorY + 1, w + 2, 2);

    // Sofa: back cushions, seat, arms
    rect(g, C.navy, x + 4, floorY - 22, w - 8, 12);
    rect(g, C.navyLight, x + 4, floorY - 22, w - 8, 1);
    for (let i = 1; i < 3; i++) rect(g, C.navyDark, x + 4 + i * (w - 8) / 3, floorY - 21, 1, 11);
    rect(g, C.navyLight, x + 4, floorY - 10, w - 8, 1);
    rect(g, C.navy, x + 4, floorY - 9, w - 8, 6);
    rect(g, C.navy, x, floorY - 16, 5, 14);
    rect(g, C.navy, x + w - 5, floorY - 16, 5, 14);
    rect(g, C.navyLight, x, floorY - 16, 5, 1);
    rect(g, C.navyLight, x + w - 5, floorY - 16, 5, 1);
    rect(g, C.navyDark, x, floorY - 3, w, 1);
    rect(g, C.navyDark, x + 2, floorY - 2, 2, 2); // legs
    rect(g, C.navyDark, x + w - 4, floorY - 2, 2, 2);
    rect(g, C.cushion, x + w - 15, floorY - 16, 8, 6);

    // Coffee table in front, with books and a mug
    const tx = x + 12, tw = 32;
    rect(g, C.woodLight, tx, floorY - 9, tw, 1);
    rect(g, C.wood, tx, floorY - 8, tw, 2);
    rect(g, C.woodDark, tx + 1, floorY - 6, 2, 6);
    rect(g, C.woodDark, tx + tw - 3, floorY - 6, 2, 6);
    rect(g, C.books[1], tx + 5, floorY - 11, 8, 2);
    rect(g, C.books[2], tx + 6, floorY - 12, 7, 1);
    rect(g, C.mat, tx + 22, floorY - 12, 3, 3);
    rect(g, C.mat, tx + 25, floorY - 11, 1, 1);

    // Pendant lamp hanging from the ceiling, over the sofa
    const lampX = x + w / 2;
    const shadeY = ceilingY + PENDANT_CORD;
    rect(g, C.pendant, lampX, ceilingY, 1, PENDANT_CORD); // short cord from the ceiling
    rect(g, C.pendant, lampX - 3, shadeY, 7, 2);
    rect(g, C.pendant, lampX - 6, shadeY + 2, 13, 3);
    rect(g, C.pendantLight, lampX - 5, shadeY + 5, 11, 1);
}

function paintWindow(g, x, floorY, wallTop, random) {
    const w = 48, winX = x + 6, winW = 36, winY = wallTop + 16, winH = 30;

    // Night city through the glass
    C.sky.forEach((color, i) => rect(g, color, winX, winY + i * winH / 4, winW, Math.ceil(winH / 4)));
    for (let bx = winX; bx < winX + winW;) {
        const bw = 3 + Math.floor(random() * 4);
        const bh = 6 + Math.floor(random() * 14);
        rect(g, C.city, bx, winY + winH - bh, bw, bh);
        for (let wy = winY + winH - bh + 2; wy < winY + winH - 1; wy += 2) {
            if (random() < 0.4) rect(g, C.cityWindow, bx + 1, wy, 1, 1);
        }
        bx += bw;
    }

    // Frame and middle bar
    rect(g, C.woodDark, winX - 2, winY - 2, winW + 4, 2);
    rect(g, C.woodDark, winX - 2, winY + winH, winW + 4, 2);
    rect(g, C.woodDark, winX - 2, winY, 2, winH);
    rect(g, C.woodDark, winX + winW, winY, 2, winH);
    rect(g, C.woodDark, winX + winW / 2 - 1, winY, 2, winH);

    // Curtain rod and curtains
    rect(g, C.wood, x, winY - 4, w, 1);
    [x, x + w - 7].forEach(cx => {
        rect(g, C.curtain, cx, winY - 3, 7, winH + 12);
        rect(g, C.curtainLight, cx + 2, winY - 3, 1, winH + 12);
        rect(g, C.curtainDark, cx + 5, winY - 3, 1, winH + 12);
    });
}

function paintTv(g, x, floorY, wallTop, random) {
    // Wall shelf with a trailing plant and books
    const sx = x + 10;
    rect(g, C.wood, sx, wallTop + 30, 30, 2);
    rect(g, C.pot, sx + 3, wallTop + 26, 5, 4);
    [[2, 24], [6, 23], [4, 22], [1, 32], [1, 35], [8, 33]].forEach(([lx, ly]) => {
        rect(g, C.leaf, sx + lx, wallTop + ly, 2, 2);
    });
    for (let i = 0; i < 4; i++) rect(g, C.books[i], sx + 18 + i * 2, wallTop + 24 + (i % 2), 2, 6 - (i % 2));

    // Speaker
    rect(g, C.speaker, x, floorY - 22, 6, 22);
    rect(g, C.speakerCone, x + 2, floorY - 18, 2, 2);
    rect(g, C.speakerCone, x + 2, floorY - 10, 2, 2);

    // TV stand with doors and a shelf of games
    const standX = x + 8, standW = 38;
    rect(g, C.wood, standX, floorY - 12, standW, 12);
    rect(g, C.woodLight, standX, floorY - 12, standW, 1);
    rect(g, C.woodDark, standX + 12, floorY - 10, 1, 9);
    rect(g, C.woodDark, standX + standW - 13, floorY - 10, 1, 9);
    rect(g, C.shelfInside, standX + 14, floorY - 9, standW - 28, 7);
    for (let i = 0; i < 4; i++) rect(g, C.books[(i + 1) % 5], standX + 15 + i * 2, floorY - 7, 1, 5);

    // TV
    const tvX = standX + 4, tvW = 30;
    rect(g, C.tvFrame, tvX, floorY - 32, tvW, 19);
    rect(g, C.black, tvX + 1, floorY - 31, tvW - 2, 16);
    rect(g, C.tvFrame, tvX + tvW / 2 - 3, floorY - 13, 6, 1);
}

function paintFloorLamp(g, x, floorY, wallTop) {
    // Poster with a red sun on the wall
    paintFramedPicture(g, x - 2, wallTop + 14, 14, 18, (ix, iy, iw, ih) => {
        rect(g, '#2a2c4a', ix, iy, iw, ih);
        rect(g, C.red, ix + 2, iy + 2, 4, 4);
        rect(g, C.red, ix + 1, iy + 3, 6, 2);
        rect(g, '#3a3a5a', ix, iy + ih - 3, iw, 3);
    });

    // Lamp
    const poleX = x + 7;
    rect(g, C.pole, poleX - 3, floorY - 2, 7, 2);
    rect(g, C.pole, poleX, floorY - 48, 1, 46);
    rect(g, C.lampShade, poleX - 4, floorY - 56, 9, 8);
    rect(g, C.lampGlow, poleX - 3, floorY - 49, 7, 1);
}

// In order across the room. Lower priority = left out first when there's no room.
const FURNITURE = [
    { width: 22, priority: 4, paint: paintBookshelf },
    { width: 14, priority: 1, paint: paintPlant },
    { width: 56, priority: 6, paint: paintSofa },
    { width: 48, priority: 5, paint: paintWindow },
    { width: 46, priority: 3, paint: paintTv },
    { width: 14, priority: 2, paint: paintFloorLamp }
];

// Pick what fits between `from` and `to`, then spread it out evenly.
function arrangeFurniture(from, to) {
    let chosen = [...FURNITURE];
    const totalWidth = list => list.reduce((sum, item) => sum + item.width, 0);
    while (chosen.length > 0 && totalWidth(chosen) > to - from) {
        const leastImportant = chosen.reduce((a, b) => (b.priority < a.priority ? b : a));
        chosen = chosen.filter(item => item !== leastImportant);
    }
    const gap = (to - from - totalWidth(chosen)) / (chosen.length + 1);
    let x = from + gap;
    return chosen.map(item => {
        const placed = { item, x: Math.round(x) };
        x += item.width + gap;
        return placed;
    });
}

export class LivingRoom {
    // scale: game pixels per art pixel (match the character's scale).
    constructor({ scale = 1, seed = 7 } = {}) {
        this.scale = scale;
        this.seed = seed;
        this.floor = null;
        this.image = null;
        this.emptyWall = null; // { top, height } of the bare wall above the decorations
    }

    // Paint the room to fit `floor`. Call again after the floor is rebuilt.
    placeOn(floor) {
        this.floor = floor;
        const s = this.scale;
        const width = Math.ceil(floor.width / s);
        const height = Math.ceil(floor.height / s);
        const floorY = Math.floor((floor.groundY - floor.top) / s);
        const ceilingY = CEILING_Y;
        const wallTop = Math.max(ceilingY + 2, floorY - DECOR_HEIGHT);
        // Bare wall between the ceiling and the decorations, in game pixels from the floor's top
        this.emptyWall = { top: (ceilingY + 4) * s, height: (wallTop + 8 - ceilingY - 4) * s };

        // Free space for furniture: between the doors on the left and right
        let from = DOOR_CLEARANCE, to = width - DOOR_CLEARANCE;
        floor.doors.forEach(door => {
            const doorStart = door.x / s - DOOR_CLEARANCE;
            const doorEnd = (door.x + door.width) / s + DOOR_CLEARANCE;
            if (doorEnd < width / 2) from = Math.max(from, doorEnd);
            else to = Math.min(to, doorStart);
        });

        const random = seededRandom(this.seed);
        this.image = makeImage(width, height, g => {
            paintShell(g, width, height, floorY, ceilingY);
            arrangeFurniture(from, to).forEach(({ item, x }) => item.paint(g, x, floorY, wallTop, random, ceilingY));
        });
    }

    draw(ctx, camera) {
        if (!this.image) return;
        drawPixelArt(ctx, this.image, -camera.left, this.floor.top - camera.top, this.scale);
    }
}
