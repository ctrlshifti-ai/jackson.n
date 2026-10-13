// A snowy daytime street that fills a floor: blue sky with clouds, a pale city
// skyline, snowy trees, three buildings (the places I worked), and a sidewalk
// with the road in front. The buildings are sized so the first FIT_ON_SCREEN
// fit between the doors on a normal-width floor; any more make the street
// longer (it scrolls). Each door gets a building of its own around it.
// Sign board positions are kept in `signBoards` so graphics can be put on them.
//
//   const street = new Street({ scale: 1.5 });
//   street.placeOn(floor);      // after the floor's doors are added
//   floor.addScenery(street);
//   floor.showGround = false;   // the street draws its own ground
import { makeImage } from '../engine/pixels.js';
import { drawPixelArt, drawPicture, loadImage } from '../engine/draw.js';
import { seededRandom } from '../engine/math.js';

const DOOR_CLEARANCE = 8;     // space kept free on each side of a door, in art pixels
const BUILDING_GAP = 10;      // space between buildings, in art pixels
const BUILDINGS_HEIGHT = 118; // tallest building incl. emblem and lamps, in art pixels
const FIT_ON_SCREEN = 3;      // this many buildings fit on one screen; the rest extend the street
const SIGN_PADDING = 1;       // space around a picture on a sign board, in art pixels
const SIDEWALK_HEIGHT = 7;    // walkable strip under the hero's feet, in art pixels

const C = {
    sky: ['#2462d0', '#2e72dc', '#3a82e6', '#4a92ee', '#5ca2f2'],
    cloud: '#f4f8fc',
    cloudShade: '#b8d0ec',
    skyline: '#7a9ad0',
    skylineFar: '#9ab4e0',
    skylineWindow: '#b4c8ec',
    tree: '#2a5a4a',
    treeDark: '#1c443a',
    snow: '#f0f6fc',
    snowShade: '#c8d8ec',
    sidewalk: '#b8c4d4',
    sidewalkJoint: '#8894a8',
    curb: '#6a7488',
    curbTop: '#d0d8e4',
    road: '#3a4258',
    roadDark: '#2e3448',
    lane: '#e8ecf4',
    outline: '#1a2238',
    // Round building
    stripeBlue: '#2a5ab0',
    stripeWhite: '#f0f4fa',
    stripeShade: '#c8d4e8',
    stripeBlueDark: '#1e4488',
    doorDark: '#1a2a44',
    emblemLight: '#f07080',
    pillar: '#c8ccd4',
    pillarShade: '#9aa0ac',
    ring: '#3a4a6a',
    emblem: '#d83040',
    emblemDark: '#1a1a24',
    // Shops
    brick: '#7a4a3a',
    brickLine: '#5a3428',
    signFrame: '#6a4a3a',
    signFrameGreen: '#3a4a4a',
    sign: '#efe6d6',
    lampMetal: '#3a4050',
    awningRed: '#d03040',
    awningCream: '#f0e0c8',
    awningGreen: '#1a8a6a',
    awningGreenDark: '#126a52',
    glass: '#3a6a7a',
    glassLight: '#6a9aa8',
    shelf: '#5a4a3a',
    frame: '#3a2a22',
    doorWood: '#7a4a2a',
    handle: '#e0a84a',
    tile: '#4a6a5a',
    tileLine: '#3a5648',
    plant: '#3a7a3a',
    board: '#2a3a34',
    boardFrame: '#6a4a2a',
    bin: '#3a6a4a',
    // Buildings around the doors
    stone: '#4e5e7a',
    stoneLight: '#6a7a96',
    stoneJoint: '#3e4c66',
    cornice: '#2e3850',
    wallLamp: '#f8d878',
    // Office building
    office: '#8a94a8',
    officeLine: '#6e7890'
};

function rect(g, color, x, y, w, h) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// A cap of snow along the top of something, with a few lumps.
function snowCap(g, x, y, w, random) {
    rect(g, C.snow, x - 1, y - 2, w + 2, 2);
    for (let sx = x; sx < x + w - 2; sx += 3 + Math.floor(random() * 4)) {
        rect(g, C.snow, sx, y - 3, 2 + Math.floor(random() * 3), 1);
    }
    rect(g, C.snowShade, x - 1, y, w + 2, 1);
}

/* ---------- Background ---------- */

function paintSky(g, width, floorY, random) {
    const bandHeight = Math.ceil(floorY / C.sky.length);
    C.sky.forEach((color, i) => rect(g, color, 0, i * bandHeight, width, bandHeight));

    // Puffy clouds: clusters of overlapping blobs with a shaded bottom
    for (let i = 0; i < width / 60; i++) {
        const cx = random() * width;
        const cy = 8 + random() * floorY * 0.35;
        for (let b = 0; b < 4; b++) {
            const bw = 8 + Math.floor(random() * 10);
            const bx = cx + b * 6 - 10;
            const by = cy - Math.floor(random() * 4);
            rect(g, C.cloud, bx, by, bw, 4);
            rect(g, C.cloud, bx + 2, by - 2, bw - 4, 2);
            rect(g, C.cloudShade, bx, by + 4, bw, 1);
        }
    }
}

function paintSkyline(g, width, floorY, random) {
    const base = floorY - 6;
    [[C.skylineFar, 0.6], [C.skyline, 1]].forEach(([color, heightFactor]) => {
        for (let x = -4; x < width;) {
            const w = 8 + Math.floor(random() * 14);
            const h = Math.floor((18 + random() * 30) * heightFactor);
            rect(g, color, x, base - h, w, h);
            if (color === C.skyline) {
                for (let wy = base - h + 3; wy < base - 2; wy += 4) {
                    for (let wx = x + 2; wx < x + w - 1; wx += 3) {
                        if (random() < 0.3) rect(g, C.skylineWindow, wx, wy, 1, 1);
                    }
                }
            }
            x += w + Math.floor(random() * 3);
        }
    });
}

function paintTrees(g, width, floorY, random) {
    for (let x = -6; x < width; x += 10 + Math.floor(random() * 8)) {
        const h = 14 + Math.floor(random() * 10);
        const top = floorY - 4 - h;
        rect(g, C.treeDark, x + 1, top + 3, 12, h - 3);
        rect(g, C.tree, x + 2, top + 2, 10, h - 4);
        rect(g, C.tree, x + 4, top, 6, 3);
        // snow on the branches
        rect(g, C.snow, x + 4, top - 1, 6, 2);
        rect(g, C.snow, x + 1, top + 6, 5, 2);
        rect(g, C.snow, x + 8, top + 9, 5, 2);
        rect(g, C.snowShade, x + 2, top + 12, 4, 1);
    }
    // snowbank behind the sidewalk
    rect(g, C.snow, 0, floorY - 4, width, 4);
    rect(g, C.snowShade, 0, floorY - 1, width, 1);
}

function paintGround(g, width, height, floorY, random) {
    // Sidewalk
    rect(g, C.sidewalk, 0, floorY, width, SIDEWALK_HEIGHT);
    for (let x = 0; x < width; x += 24) rect(g, C.sidewalkJoint, x, floorY + 1, 1, SIDEWALK_HEIGHT - 1);
    rect(g, C.sidewalkJoint, 0, floorY + SIDEWALK_HEIGHT - 1, width, 1);
    for (let x = 0; x < width; x += 9 + Math.floor(random() * 20)) {
        rect(g, C.snow, x, floorY + 1 + Math.floor(random() * 3), 3 + Math.floor(random() * 6), 1);
    }

    // Curb
    const curbY = floorY + SIDEWALK_HEIGHT;
    rect(g, C.curbTop, 0, curbY, width, 1);
    rect(g, C.curb, 0, curbY + 1, width, 2);

    // Road with lane markings and a bit of snow
    const roadY = curbY + 3;
    rect(g, C.road, 0, roadY, width, height - roadY);
    rect(g, C.roadDark, 0, roadY, width, 1);
    const laneY = roadY + Math.floor((height - roadY) / 2);
    for (let x = 6; x < width; x += 40) rect(g, C.lane, x, laneY, 16, 1);
    for (let x = 0; x < width; x += 15 + Math.floor(random() * 30)) {
        rect(g, C.snow, x, roadY + 1 + Math.floor(random() * 3), 2 + Math.floor(random() * 4), 1);
    }
}

/* ---------- Buildings (each painted at x, standing on floorY) ---------- */

// Round striped building: a cylinder with curved blue/white bands, an oval
// roof ring with windows and a red emblem, curved wings on both sides, grey
// pillars and a stone entrance.
function paintRoundBuilding(g, x, floorY, random) {
    const w = 128, stripe = 7;
    const bandColor = (band, shade) => band % 2 === 0
        ? (shade ? C.stripeShade : C.stripeWhite)
        : (shade ? C.stripeBlueDark : C.stripeBlue);

    // Paint a striped curved surface from column x0 to x1. The bands bow
    // downwards toward `curveFrom`'s far side, like a cylinder seen from the street.
    function curvedStripes(x0, x1, top, centerX, halfWidth, bow) {
        for (let cx = x0; cx < x1; cx++) {
            const t = (cx + 0.5 - centerX) / halfWidth;
            const curve = Math.round(bow * t * t);
            const shade = t > 0.55;                              // right side in shadow
            for (let y = top + curve; y < floorY; y++) {
                rect(g, bandColor(Math.floor((y - top - curve) / stripe), shade), cx, y, 1, 1);
            }
            rect(g, C.outline, cx, top + curve, 1, 1);           // top edge
        }
        rect(g, C.outline, x0, top + Math.round(bow), 1, floorY - top);
        rect(g, C.outline, x1 - 1, top + Math.round(bow), 1, floorY - top);
    }

    // Main cylinder
    const bodyX = x + 26, bodyW = 76, bodyCenter = bodyX + bodyW / 2, bodyTop = floorY - 86;
    curvedStripes(bodyX, bodyX + bodyW, bodyTop, bodyCenter, bodyW / 2, 6);

    // Oval roof ring: dark band with windows, snowy roof inside
    const ringY = bodyTop + 1, outerW = 46, outerH = 8, innerW = 39, innerH = 4;
    for (let dx = -outerW; dx <= outerW; dx++) {
        const outer = Math.round(outerH * Math.sqrt(Math.max(0, 1 - (dx / outerW) ** 2)));
        rect(g, C.ring, bodyCenter + dx, ringY - outer, 1, outer * 2 + 1);
        if (Math.abs(dx) < innerW) {
            const inner = Math.round(innerH * Math.sqrt(1 - (dx / innerW) ** 2));
            rect(g, C.snow, bodyCenter + dx, ringY - outer + 2, 1, Math.max(1, outer - 2 + inner));
        }
        // windows along the front of the ring
        if ((dx + outerW) % 6 < 3 && Math.abs(dx) < outerW - 2) {
            rect(g, C.stripeWhite, bodyCenter + dx, ringY + outer - 2, 1, 2);
        }
    }
    rect(g, C.snowShade, bodyCenter - innerW + 4, ringY + 1, innerW * 2 - 8, 1);

    // Red emblem standing on the back of the ring
    const ex = bodyCenter, ey = ringY - outerH - 7, r = 9;
    for (let dy = -r; dy <= r; dy++) {
        const half = Math.round(Math.sqrt(r * r - dy * dy));
        rect(g, C.emblemDark, ex - half - 1, ey + dy, half * 2 + 2, 1);
        rect(g, C.emblem, ex - half, ey + dy, half * 2, 1);
    }
    rect(g, C.emblemLight, ex - 5, ey - 6, 3, 1);                // shine
    // the mark: a lowercase "r" (stem with an arm curling over to the right)
    rect(g, C.emblemDark, ex - 3, ey - 4, 2, 9);   // stem
    rect(g, C.emblemDark, ex - 1, ey - 3, 1, 1);   // where the arm leaves the stem
    rect(g, C.emblemDark, ex, ey - 4, 3, 1);       // arm across the top
    rect(g, C.emblemDark, ex, ey - 5, 2, 1);
    rect(g, C.emblemDark, ex + 3, ey - 3, 1, 2);   // arm curling down at the end

    // Curved wings on both sides, lower than the body, snow along the top
    const wingW = 28, wingTop = floorY - 40;
    curvedStripes(x, x + wingW, wingTop, x + wingW, wingW, 5);           // bows down to the left
    curvedStripes(x + w - wingW, x + w, wingTop, x + w - wingW, wingW, 5); // bows down to the right
    for (let i = 0; i < wingW; i++) {
        const tl = (wingW - i) / wingW, tr = i / wingW;
        rect(g, C.snow, x + i, wingTop + Math.round(5 * tl * tl) - 2, 1, 2);
        rect(g, C.snow, x + w - wingW + i, wingTop + Math.round(5 * tr * tr) - 2, 1, 2);
    }

    // Grey pillars where the wings meet the body
    [bodyX - 4, bodyX + bodyW - 6].forEach(px => {
        rect(g, C.pillar, px, wingTop - 6, 10, floorY - wingTop + 6);
        rect(g, C.pillarShade, px + 8, wingTop - 6, 2, floorY - wingTop + 6);
        rect(g, C.outline, px, wingTop - 6, 10, 1);
        snowCap(g, px, wingTop - 6, 10, random);
    });

    // Entrance: stone portal with a lintel slab and a dark double door
    const portalW = 30, portalX = bodyCenter - portalW / 2, portalTop = floorY - 32;
    rect(g, C.pillar, portalX, portalTop, portalW, floorY - portalTop);
    rect(g, C.pillarShade, portalX + portalW - 3, portalTop, 3, floorY - portalTop);
    rect(g, C.pillar, portalX - 3, portalTop - 4, portalW + 6, 4);
    rect(g, C.outline, portalX - 3, portalTop, portalW + 6, 1);
    snowCap(g, portalX - 3, portalTop - 4, portalW + 6, random);
    rect(g, C.outline, portalX + 6, portalTop + 6, portalW - 12, floorY - portalTop - 6);
    rect(g, C.doorDark, portalX + 7, portalTop + 7, portalW - 14, floorY - portalTop - 7);
    rect(g, C.outline, bodyCenter, portalTop + 7, 1, floorY - portalTop - 7);

    // Snow piled up around the base
    for (let sx = x - 2; sx < x + w + 2; sx += 4) {
        const h = 2 + Math.floor(random() * 4);
        rect(g, C.snow, sx, floorY - h, 5, h);
    }
    rect(g, C.snowShade, x - 2, floorY - 1, w + 4, 1);
}

// Shop front: sign board with lamps, awning, windows, door. Returns the sign's
// rectangle (in art pixels) so graphics can be placed on it.
function paintShop(g, x, floorY, random, look) {
    const w = 100, facadeH = 54, facadeTop = floorY - facadeH;

    // Facade
    rect(g, look.wall, x, facadeTop, w, facadeH);
    for (let y = facadeTop + 3; y < floorY; y += 4) rect(g, look.wallLine, x, y, w, 1);
    for (let y = facadeTop, row = 0; y < floorY; y += 4, row++) {
        for (let bx = x + (row % 2) * 4; bx < x + w; bx += 8) rect(g, look.wallLine, bx, y, 1, 3);
    }
    rect(g, C.outline, x, facadeTop, 1, facadeH);
    rect(g, C.outline, x + w - 1, facadeTop, 1, facadeH);

    // Sign board on the roof, with lamps on top. Wide by default; a shop can
    // ask for its own size (e.g. squarer, to fit a logo).
    const board = look.board || { width: w - 8, height: 24 };
    const sign = { x: x + Math.round((w - board.width) / 2), y: facadeTop - 4 - board.height, ...board };
    rect(g, look.signFrame, sign.x - 2, sign.y - 2, sign.width + 4, sign.height + 4);
    rect(g, C.sign, sign.x, sign.y, sign.width, sign.height);
    snowCap(g, sign.x - 2, sign.y - 2, sign.width + 4, random);
    const lampSpots = sign.width < 60 ? [0.25, 0.75] : [0.2, 0.5, 0.8];
    lampSpots.forEach(t => {
        const lx = Math.round(sign.x + sign.width * t);
        rect(g, C.lampMetal, lx - 1, sign.y - 8, 3, 6);
        rect(g, C.lampMetal, lx - 3, sign.y - 10, 7, 3);
        rect(g, C.snow, lx - 3, sign.y - 11, 7, 1);
    });
    rect(g, look.signFrame, x, facadeTop - 2, w, 2); // ledge under the sign

    // Awning with snow on top
    const awningY = facadeTop + 4;
    for (let ax = x - 2; ax < x + w + 2; ax += 6) {
        const color = Math.floor((ax - x + 2) / 6) % 2 === 0 ? look.awning : look.awningAlt;
        rect(g, color, ax, awningY, Math.min(6, x + w + 2 - ax), 8);
        rect(g, color, ax + 1, awningY + 8, 4, 1); // scalloped edge
    }
    snowCap(g, x - 2, awningY, w + 4, random);

    // Shop windows with shelves inside
    const winTop = awningY + 12, winH = floorY - winTop - 6;
    [[x + 6, 34], [x + 42, 26]].forEach(([wx, ww]) => {
        rect(g, C.frame, wx - 1, winTop - 1, ww + 2, winH + 2);
        rect(g, C.glass, wx, winTop, ww, winH);
        rect(g, C.shelf, wx + 2, winTop + 8, ww - 4, 1);
        rect(g, C.shelf, wx + 2, winTop + 16, ww - 4, 1);
        for (let i = 0; i < ww - 6; i += 4) rect(g, look.goods[i % look.goods.length], wx + 3 + i, winTop + 5, 2, 3);
        rect(g, C.glassLight, wx + 2, winTop + 2, 1, winH - 4);   // reflection
        rect(g, C.glassLight, wx + 4, winTop + 2, 1, 4);
    });

    // Door with a glass panel
    const doorX = x + 74, doorW = 18, doorTop = winTop - 2;
    rect(g, C.frame, doorX - 1, doorTop - 1, doorW + 2, floorY - doorTop + 1);
    rect(g, look.door, doorX, doorTop, doorW, floorY - doorTop);
    rect(g, C.glass, doorX + 3, doorTop + 3, doorW - 6, 14);
    rect(g, C.glassLight, doorX + 4, doorTop + 4, 1, 5);
    rect(g, C.handle, doorX + 2, doorTop + 20, 3, 1);

    look.extra(g, x, w, floorY, random);
    return sign;
}

const BRICK_SHOP = {
    wall: C.brick, wallLine: C.brickLine, signFrame: C.signFrame,
    awning: C.awningRed, awningAlt: C.awningCream, door: C.doorWood,
    goods: ['#e8b84c', '#c84c4c', '#f0e0c8'],
    // Small squarish board to fit the SugarBox logo (img/sugarbox.png is 220x261)
    board: { width: 20, height: 23 },
    // Planter under the window and a chalkboard sign on the sidewalk
    extra(g, x, w, floorY, random) {
        rect(g, C.frame, x + 4, floorY - 6, 38, 6);
        rect(g, C.plant, x + 5, floorY - 8, 36, 2);
        snowCap(g, x + 5, floorY - 8, 36, random);
        const bx = x - 10;
        rect(g, C.boardFrame, bx, floorY - 14, 10, 13);
        rect(g, C.board, bx + 1, floorY - 13, 8, 10);
        rect(g, C.lane, bx + 2, floorY - 11, 5, 1);
        rect(g, C.lane, bx + 2, floorY - 8, 4, 1);
        rect(g, C.boardFrame, bx, floorY - 1, 1, 3);
        rect(g, C.boardFrame, bx + 9, floorY - 1, 1, 3);
        snowCap(g, bx, floorY - 14, 10, random);
    }
};

const GREEN_SHOP = {
    wall: C.tile, wallLine: C.tileLine, signFrame: C.signFrameGreen,
    awning: C.awningGreen, awningAlt: C.awningGreenDark, door: C.tile,
    goods: ['#c8ccd4', '#e8b84c', '#8a5cb8'],
    // Rubbish bin beside the shop
    extra(g, x, w, floorY, random) {
        const bx = x + w + 2;
        rect(g, C.bin, bx, floorY - 14, 10, 14);
        rect(g, C.tileLine, bx, floorY - 14, 10, 2);
        rect(g, C.tileLine, bx + 4, floorY - 10, 2, 4);
        snowCap(g, bx, floorY - 14, 10, random);
    }
};

// A narrow stone building standing around a door (x, width and height are the
// door's, in art pixels), with an empty sign board over the door. Returns the
// board's rectangle.
function paintDoorBuilding(g, doorX, doorWidth, doorHeight, floorY, random) {
    const side = 8, above = 26;
    const x = doorX - side, w = doorWidth + side * 2, top = floorY - doorHeight - above;

    // Stone blocks
    rect(g, C.stone, x, top, w, floorY - top);
    for (let y = top + 6, row = 0; y < floorY; y += 6, row++) {
        rect(g, C.stoneJoint, x, y, w, 1);
        for (let bx = x + (row % 2) * 6; bx < x + w; bx += 12) rect(g, C.stoneJoint, bx, y - 5, 1, 5);
    }
    rect(g, C.stoneLight, x, top, 1, floorY - top);
    rect(g, C.outline, x + w - 1, top, 1, floorY - top);

    // Cornice along the roof, with snow
    rect(g, C.cornice, x - 2, top - 3, w + 4, 3);
    snowCap(g, x - 2, top - 3, w + 4, random);

    // Empty sign board above the door
    const board = { x: x + 3, y: top + 4, width: w - 6, height: 14 };
    rect(g, C.signFrameGreen, board.x - 1, board.y - 1, board.width + 2, board.height + 2);
    rect(g, C.sign, board.x, board.y, board.width, board.height);

    // Wall lamps on both sides of the door
    const lampY = floorY - doorHeight + 10;
    [x + 3, x + w - 5].forEach(lx => {
        rect(g, C.cornice, lx, lampY, 2, 4);
        rect(g, C.wallLamp, lx, lampY + 1, 2, 2);
    });

    // Snow along the base
    rect(g, C.snow, x - 1, floorY - 2, w + 2, 2);
    return board;
}

const OFFICE = {
    wall: C.office, wallLine: C.officeLine, signFrame: C.cornice,
    awning: C.stripeBlue, awningAlt: C.stripeBlueDark, door: C.stone,
    goods: ['#c8ccd4', '#2a5ab0', '#e8b84c'],
    // Street lamp beside the building
    extra(g, x, w, floorY, random) {
        const px = x + w + 5;
        rect(g, C.lampMetal, px, floorY - 42, 2, 42);
        rect(g, C.lampMetal, px - 2, floorY - 45, 6, 3);
        rect(g, C.wallLamp, px - 1, floorY - 42, 4, 1);
        snowCap(g, px - 2, floorY - 45, 6, random);
    }
};

// In order along the street.
const BUILDINGS = [
    { width: 128, paint: paintRoundBuilding },
    { width: 112, paint: (g, x, floorY, random) => paintShop(g, x + 10, floorY, random, BRICK_SHOP) },
    { width: 114, paint: (g, x, floorY, random) => paintShop(g, x, floorY, random, GREEN_SHOP) },
    { width: 112, paint: (g, x, floorY, random) => paintShop(g, x + 2, floorY, random, OFFICE) }
];

const artWidthOf = list => list.reduce((sum, b) => sum + b.width, 0) + BUILDING_GAP * (list.length - 1);

export class Street {
    // scale: game pixels per art pixel (match the character's scale). The
    // buildings use this scale too, or smaller if that's what it takes to fit.
    constructor({ scale = 1, seed = 11 } = {}) {
        this.scale = scale;
        this.seed = seed;
        this.floor = null;
        this.image = null;            // sky, trees, sidewalk and road
        this.buildings = null;        // the three buildings, drawn on top
        this.buildingsAt = null;      // { x, y, scale } where and how big the buildings are drawn
        this.signBoards = [];         // { x, y, width, height } in game pixels from the floor's top-left
        this.signImages = [];         // pictures shown on the sign boards, by board number
        this.buildingSpots = [];      // { x, width, top } of each building in game pixels, left to right
        this.road = null;             // { top, bottom } of the road in world game pixels
        this.doorSigns = [];          // sign boards over the left and right doors (same format as signBoards)
    }

    // How wide the street floor needs to be. `normalWidth` is a normal floor's
    // width and `doorEdge` how far a door's far side is from the floor's edge
    // (both in game pixels).
    widthFor(normalWidth, doorEdge) {
        const zone = doorEdge + DOOR_CLEARANCE * this.scale; // kept free at each end
        const buildingScale = Math.min(this.scale, (normalWidth - zone * 2) / artWidthOf(BUILDINGS.slice(0, FIT_ON_SCREEN)));
        return Math.ceil(zone * 2 + artWidthOf(BUILDINGS) * buildingScale);
    }

    // Show a picture on a sign board (0 = the brick shop, 1 = the green shop,
    // 2 = the office, 3 = the building around the left door, 4 = around the right door).
    // It's drawn at full screen resolution inside the board, so it stays crisp.
    setSign(boardNumber, src) {
        this.signImages[boardNumber] = loadImage(src);
    }

    // Paint the street to fit `floor`. Call again after the floor is rebuilt.
    placeOn(floor) {
        this.floor = floor;
        const s = this.scale;
        const width = Math.ceil(floor.width / s);
        const height = Math.ceil(floor.height / s);
        const floorY = Math.floor((floor.groundY - floor.top) / s);
        const random = seededRandom(this.seed);

        const roadTop = floorY + SIDEWALK_HEIGHT + 3; // below the sidewalk and curb, in art pixels
        this.road = { top: floor.top + roadTop * s, bottom: floor.bottom };

        const doorBoards = [];
        this.image = makeImage(width, height, g => {
            paintSky(g, width, floorY, random);
            paintSkyline(g, width, floorY, random);
            paintTrees(g, width, floorY, random);
            [...floor.doors].sort((a, b) => a.x - b.x).forEach(door => {
                doorBoards.push(paintDoorBuilding(g, Math.round(door.x / s), Math.round(door.width / s),
                    Math.round(door.height / s), floorY, random));
            });
            paintGround(g, width, height, floorY, random);
        });

        // All three buildings side by side on their own canvas
        const artWidth = artWidthOf(BUILDINGS);
        const boards = [];
        const spots = [];
        this.buildings = makeImage(artWidth, BUILDINGS_HEIGHT, g => {
            let x = 0;
            BUILDINGS.forEach(building => {
                const sign = building.paint(g, x, BUILDINGS_HEIGHT, random);
                if (sign) boards.push(sign);
                spots.push({ x, width: building.width });
                x += building.width + BUILDING_GAP;
            });
        });

        // Fit them between the doors on the left and right (in game pixels)
        const clearance = DOOR_CLEARANCE * s;
        let from = clearance, to = floor.width - clearance;
        floor.doors.forEach(door => {
            if (door.x + door.width / 2 < floor.width / 2) from = Math.max(from, door.x + door.width + clearance);
            else to = Math.min(to, door.x - clearance);
        });
        const buildingScale = Math.min(s, (to - from) / artWidth);
        const at = {
            x: from + (to - from - artWidth * buildingScale) / 2,
            y: floor.groundY - floor.top - BUILDINGS_HEIGHT * buildingScale,
            scale: buildingScale
        };
        this.buildingsAt = at;
        this.buildingSpots = spots.map(spot => ({
            x: at.x + spot.x * at.scale,
            width: spot.width * at.scale,
            top: at.y
        }));
        // Boards 0-2: the shops. Boards 3-4: the buildings around the left and right doors.
        this.signBoards = [
            ...boards.map(b => ({
                x: at.x + b.x * at.scale,
                y: at.y + b.y * at.scale,
                width: b.width * at.scale,
                height: b.height * at.scale
            })),
            ...doorBoards.map(b => ({ x: b.x * s, y: b.y * s, width: b.width * s, height: b.height * s }))
        ];
        this.doorSigns = this.signBoards.slice(boards.length);
    }

    draw(ctx, camera) {
        if (!this.image) return;
        const top = this.floor.top - camera.top;
        drawPixelArt(ctx, this.image, -camera.left, top, this.scale);
        const at = this.buildingsAt;
        drawPixelArt(ctx, this.buildings, at.x - camera.left, top + at.y, at.scale);
        this.signImages.forEach((image, i) => {
            const board = this.signBoards[i];
            if (image && board) this.drawSignPicture(ctx, image, board, camera, top);
        });
    }

    // Fit a picture inside its board (keeping its shape, centered, with padding).
    drawSignPicture(ctx, image, board, camera, top) {
        if (!image.naturalWidth) return; // still loading
        const padding = SIGN_PADDING * this.buildingsAt.scale;
        const fit = Math.min(
            (board.width - padding * 2) / image.naturalWidth,
            (board.height - padding * 2) / image.naturalHeight
        );
        const w = image.naturalWidth * fit, h = image.naturalHeight * fit;
        const x = board.x + (board.width - w) / 2 - camera.left;
        const y = top + board.y + (board.height - h) / 2;
        drawPicture(ctx, image, x, y, w, h);
    }
}
