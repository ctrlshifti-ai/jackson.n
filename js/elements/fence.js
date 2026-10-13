// A metal railing standing along a floor, like the edge of a rooftop.
// Drawn behind the doors and the character.
import { makeImage } from '../engine/pixels.js';
import { drawPixelArt } from '../engine/draw.js';

const COLORS = {
    metal: '#2c2c44',
    highlight: '#8888b0'
};

const HEIGHT = 20;

// One 16px-wide section: a post, two thin bars and the rails between them.
const SECTION = makeImage(16, HEIGHT, g => {
    g.fillStyle = COLORS.metal;
    g.fillRect(0, 0, 16, 2);           // top rail
    g.fillRect(0, 10, 16, 1);          // middle rail
    g.fillRect(0, HEIGHT - 1, 16, 1);  // bottom rail
    g.fillRect(0, 0, 2, HEIGHT);       // post
    g.fillRect(6, 2, 1, HEIGHT - 2);   // bars
    g.fillRect(11, 2, 1, HEIGHT - 2);
    g.fillStyle = COLORS.highlight;    // light catching the top
    g.fillRect(0, 0, 16, 1);
    g.fillRect(0, 0, 1, HEIGHT);
});

export class Fence {
    // scale: 2 = every art pixel is 2x2 game pixels.
    constructor(floor, { fromX = 0, toX = floor.width, scale = 1 } = {}) {
        this.floor = floor;
        this.fromX = fromX;
        this.toX = toX;
        this.scale = scale;
    }

    draw(ctx, camera) {
        const sectionWidth = SECTION.width * this.scale;
        const y = this.floor.groundY - HEIGHT * this.scale - camera.top;
        const firstX = Math.max(this.fromX, Math.floor(camera.left / sectionWidth) * sectionWidth);
        const lastX = Math.min(this.toX, camera.left + camera.viewWidth);
        for (let x = firstX; x < lastX; x += sectionWidth) {
            drawPixelArt(ctx, SECTION, x - camera.left, y, this.scale);
        }
    }
}
