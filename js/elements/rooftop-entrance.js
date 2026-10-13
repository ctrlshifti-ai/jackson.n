// The little concrete hut on a rooftop that a stairway comes up into.
// Stand it behind a door to make that door the way into the building.
import { makeImage } from '../engine/pixels.js';
import { drawPixelArt } from '../engine/draw.js';

const COLORS = {
    roofLight: '#a8a8c0',
    roof: '#6c6c88',
    roofShadow: '#2c2c40',
    wall: '#50506c',
    wallLight: '#7c7c98',
    wallShadow: '#34344a',
    joint: '#3c3c54',
    lampFixture: '#1c1c2c',
    lamp: '#f8d878'
};

const ROOF_HEIGHT = 6;
const BLOCK_WIDTH = 16;
const BLOCK_HEIGHT = 8;

function paintHut(width, height) {
    return makeImage(width, height, g => {
        // Concrete wall made of blocks
        g.fillStyle = COLORS.wall;
        g.fillRect(0, ROOF_HEIGHT, width, height - ROOF_HEIGHT);
        g.fillStyle = COLORS.joint;
        for (let y = ROOF_HEIGHT + BLOCK_HEIGHT; y < height; y += BLOCK_HEIGHT) {
            g.fillRect(0, y, width, 1);
        }
        for (let y = ROOF_HEIGHT, row = 0; y < height; y += BLOCK_HEIGHT, row++) {
            const offset = row % 2 === 0 ? 0 : BLOCK_WIDTH / 2; // stagger every other row
            for (let x = offset; x < width; x += BLOCK_WIDTH) {
                g.fillRect(x, y, 1, BLOCK_HEIGHT);
            }
        }
        g.fillStyle = COLORS.wallLight;
        g.fillRect(0, ROOF_HEIGHT, 1, height - ROOF_HEIGHT);
        g.fillStyle = COLORS.wallShadow;
        g.fillRect(width - 1, ROOF_HEIGHT, 1, height - ROOF_HEIGHT);

        // Flat roof slab
        g.fillStyle = COLORS.roof;
        g.fillRect(0, 0, width, ROOF_HEIGHT);
        g.fillStyle = COLORS.roofLight;
        g.fillRect(0, 0, width, 1);
        g.fillStyle = COLORS.roofShadow;
        g.fillRect(0, ROOF_HEIGHT - 1, width, 1);

        // Small lamp over the door
        const lampX = Math.floor(width / 2) - 2;
        g.fillStyle = COLORS.lampFixture;
        g.fillRect(lampX - 1, ROOF_HEIGHT + 3, 6, 2);
        g.fillStyle = COLORS.lamp;
        g.fillRect(lampX, ROOF_HEIGHT + 5, 4, 1);
    });
}

export class RooftopEntrance {
    // Centers the hut on `door`. Width and height are in art pixels;
    // scale: 2 = every art pixel is 2x2 game pixels.
    constructor(door, { width = 64, height = 72, scale = 1 } = {}) {
        this.scale = scale;
        this.width = width * scale;
        this.height = height * scale;
        this.x = door.x + door.width / 2 - this.width / 2;
        this.floor = door.floor;
        this.image = paintHut(width, height);
    }

    draw(ctx, camera) {
        const y = this.floor.groundY - this.height - camera.top;
        drawPixelArt(ctx, this.image, this.x - camera.left, y, this.scale);
    }
}
