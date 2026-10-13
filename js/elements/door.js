// A door standing on a floor. When the character stands in front of it,
// blinking arrows beside it show where it can go: up (previous floor) and/or
// down (next floor). The scene decides what happens when you go through.
//
// Doors come in different looks (see LOOKS): 'stone' is an arched outdoor
// door, 'wood' is a plain indoor door like the living room's.
import { makeImage, pixelArt } from '../engine/pixels.js';
import { drawPixelArt } from '../engine/draw.js';

const COLORS = {
    stone: '#7c7c7c',
    stoneLight: '#bcbcbc',
    wood: '#ac7c00',
    woodDark: '#503000',
    knob: '#f8b800',
    inside: '#000000',
    // Indoor door
    casing: '#3c2820',
    casingLight: '#6a4836',
    panel: '#5c3a2a',
    panelEdge: '#4a2e22',
    handle: '#e0a84a',
    handlePlate: '#b07a30',
    room: '#141018'
};

const WIDTH = 28;
const HEIGHT = 56;

// Stone frame with a stepped arch on top.
function drawFrame(g) {
    g.fillStyle = COLORS.stone;
    g.fillRect(4, 0, WIDTH - 8, 1);
    g.fillRect(2, 1, WIDTH - 4, 1);
    g.fillRect(1, 2, WIDTH - 2, 1);
    g.fillRect(0, 3, WIDTH, HEIGHT - 3);
    g.fillStyle = COLORS.stoneLight;
    g.fillRect(4, 0, WIDTH - 8, 1);
    g.fillRect(0, 3, 1, HEIGHT - 3);
}

// The doorway inside the frame.
const INSIDE = { x: 3, y: 4, width: WIDTH - 6, height: HEIGHT - 4 };

const STONE_CLOSED = makeImage(WIDTH, HEIGHT, g => {
    drawFrame(g);
    g.fillStyle = COLORS.wood;
    g.fillRect(INSIDE.x, INSIDE.y, INSIDE.width, INSIDE.height);
    g.fillStyle = COLORS.woodDark;
    g.fillRect(INSIDE.x, INSIDE.y, INSIDE.width, 1);                // top edge
    for (let x = INSIDE.x + 5; x < INSIDE.x + INSIDE.width; x += 5) {
        g.fillRect(x, INSIDE.y + 1, 1, INSIDE.height - 1);         // planks
    }
    g.fillRect(INSIDE.x, 14, INSIDE.width, 1);                     // braces
    g.fillRect(INSIDE.x, HEIGHT - 12, INSIDE.width, 1);
    g.fillStyle = COLORS.knob;
    g.fillRect(WIDTH - 7, 30, 2, 2);
});

const STONE_OPEN = makeImage(WIDTH, HEIGHT, g => {
    drawFrame(g);
    g.fillStyle = COLORS.inside;
    g.fillRect(INSIDE.x, INSIDE.y, INSIDE.width, INSIDE.height);
    g.fillStyle = COLORS.wood;                                     // door swung open
    g.fillRect(INSIDE.x, INSIDE.y, 4, INSIDE.height);
    g.fillStyle = COLORS.woodDark;
    g.fillRect(INSIDE.x + 4, INSIDE.y, 1, INSIDE.height);
});

// Indoor door: plain square casing, flat brown panel, gold lever handle.
const CASING = 3; // casing thickness around the panel
function drawCasing(g) {
    g.fillStyle = COLORS.casing;
    g.fillRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle = COLORS.casingLight;
    g.fillRect(0, 0, WIDTH, 1);
    g.fillRect(0, 0, 1, HEIGHT);
}

const WOOD_CLOSED = makeImage(WIDTH, HEIGHT, g => {
    drawCasing(g);
    g.fillStyle = COLORS.panel;
    g.fillRect(CASING, CASING, WIDTH - CASING * 2, HEIGHT - CASING);
    g.fillStyle = COLORS.panelEdge;                                // slight shadow along the edges
    g.fillRect(CASING, CASING, WIDTH - CASING * 2, 1);
    g.fillRect(CASING, CASING, 1, HEIGHT - CASING);
    g.fillRect(WIDTH - CASING - 1, CASING, 1, HEIGHT - CASING);
    g.fillStyle = COLORS.handlePlate;
    g.fillRect(WIDTH - 8, 29, 1, 4);
    g.fillStyle = COLORS.handle;
    g.fillRect(WIDTH - 9, 30, 4, 1);
});

const WOOD_OPEN = makeImage(WIDTH, HEIGHT, g => {
    drawCasing(g);
    g.fillStyle = COLORS.room;
    g.fillRect(CASING, CASING, WIDTH - CASING * 2, HEIGHT - CASING);
    g.fillStyle = COLORS.panel;                                    // door swung open
    g.fillRect(CASING, CASING, 4, HEIGHT - CASING);
    g.fillStyle = COLORS.panelEdge;
    g.fillRect(CASING + 4, CASING, 1, HEIGHT - CASING);
});

const LOOKS = {
    stone: { closed: STONE_CLOSED, open: STONE_OPEN },
    wood: { closed: WOOD_CLOSED, open: WOOD_OPEN }
};

const ARROW_UP = pixelArt([
    '...W...',
    '..WWW..',
    '.WWWWW.',
    'WWWWWWW'
], { W: '#fcfcfc' });
const ARROW_DOWN = pixelArt([
    'WWWWWWW',
    '.WWWWW.',
    '..WWW..',
    '...W...'
], { W: '#fcfcfc' });
const ARROW_GAP = 4; // space between the door and its arrows

export class Door {
    static WIDTH = WIDTH;
    static HEIGHT = HEIGHT;

    // arrowSide: which side of the door the arrows appear on ('left' or 'right').
    // Put them on the side facing into the room.
    // scale: 2 = every art pixel is 2x2 game pixels (arrows too).
    // look: 'stone' or 'wood' (see LOOKS).
    constructor(x, floor, { arrowSide = 'right', scale = 1, look = 'stone' } = {}) {
        this.x = x;
        this.floor = floor;       // the Floor this door stands on
        this.scale = scale;
        this.look = LOOKS[look];
        this.width = Door.WIDTH * scale;
        this.height = Door.HEIGHT * scale;
        this.arrowSide = arrowSide;
        this.isOpen = false;
        this.highlighted = false; // shows the blinking arrows
        this.canGoUp = false;     // show the up arrow
        this.canGoDown = false;   // show the down arrow
    }

    get y() {
        return this.floor.groundY - this.height;
    }

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

    isInFrontOf(character) {
        return character.centerX >= this.x + 2 && character.centerX <= this.x + this.width - 2;
    }

    draw(ctx, camera) {
        const x = this.x - camera.left;
        const y = this.y - camera.top;
        drawPixelArt(ctx, this.isOpen ? this.look.open : this.look.closed, x, y, this.scale);

        const blinkOn = Math.floor(performance.now() / 300) % 2 === 0;
        if (this.highlighted && blinkOn) this.drawArrows(ctx, x, y);
    }

    // Up and down arrows stacked beside the door, around its middle.
    drawArrows(ctx, x, y) {
        const s = this.scale;
        const arrowX = this.arrowSide === 'left'
            ? x - (ARROW_GAP + ARROW_UP.width) * s
            : x + this.width + ARROW_GAP * s;
        const middleY = y + Math.floor(this.height / 2);
        if (this.canGoUp) drawPixelArt(ctx, ARROW_UP, arrowX, middleY - (ARROW_UP.height + 2) * s, s);
        if (this.canGoDown) drawPixelArt(ctx, ARROW_DOWN, arrowX, middleY + 2 * s, s);
    }
}
