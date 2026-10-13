// One level of the building: a strip of brick ground, scenery standing on it
// (fences, walls...) and the doors.
import { makeImage } from '../engine/pixels.js';
import { drawPixelArt } from '../engine/draw.js';

const GROUND_HEIGHT = 16; // default: two rows of bricks

const BRICK = makeImage(8, 8, g => {
    g.fillStyle = '#c84c0c';
    g.fillRect(0, 0, 8, 8);
    g.fillStyle = '#fc9838';   // highlights
    g.fillRect(0, 0, 7, 1);
    g.fillRect(0, 4, 3, 1);
    g.fillRect(4, 4, 4, 1);
    g.fillStyle = '#000000';   // mortar
    g.fillRect(0, 3, 8, 1);
    g.fillRect(0, 7, 8, 1);
    g.fillRect(7, 0, 1, 3);
    g.fillRect(3, 4, 1, 3);
});

export class Floor {
    // Floors can differ in width (wider ones scroll sideways) and in how tall
    // the ground strip under the characters' feet is.
    constructor({ index, top, height, width, groundHeight = GROUND_HEIGHT }) {
        this.index = index;
        this.top = top;
        this.height = height;
        this.width = width;
        this.groundHeight = groundHeight;
        this.doors = [];
        this.scenery = []; // anything with draw(ctx, camera), drawn behind the doors
        this.foreground = []; // drawn in front of the characters (see drawForeground)
        this.showGround = true; // turn off when scenery brings its own floor
    }

    get bottom() {
        return this.top + this.height;
    }

    // Where characters stand.
    get groundY() {
        return this.bottom - this.groundHeight;
    }

    get middleY() {
        return this.top + this.height / 2;
    }

    addScenery(thing) {
        this.scenery.push(thing);
    }

    addForeground(thing) {
        this.foreground.push(thing);
    }

    // Things closer to the viewer than the characters; the scene draws these last.
    drawForeground(ctx, camera) {
        if (!camera.canSee(this.top, this.bottom)) return;
        this.foreground.forEach(thing => thing.draw(ctx, camera));
    }

    addDoor(door) {
        this.doors.push(door);
    }

    // The door closest to an x position, or null if the floor has no doors.
    nearestDoor(x) {
        let nearest = null;
        this.doors.forEach(door => {
            if (!nearest || Math.abs(door.x - x) < Math.abs(nearest.x - x)) nearest = door;
        });
        return nearest;
    }

    // The door the character is standing in front of, or null.
    doorAt(character) {
        return this.doors.find(door => door.isInFrontOf(character)) || null;
    }

    draw(ctx, camera) {
        if (!camera.canSee(this.top, this.bottom)) return;
        if (this.showGround) this.drawGround(ctx, camera);
        this.scenery.forEach(thing => thing.draw(ctx, camera));
        this.doors.forEach(door => door.draw(ctx, camera));
    }

    drawGround(ctx, camera) {
        const firstX = Math.floor(camera.left / BRICK.width) * BRICK.width;
        const lastX = Math.min(this.width, camera.left + camera.viewWidth);
        for (let y = this.groundY; y < this.bottom; y += BRICK.height) {
            for (let x = firstX; x < lastX; x += BRICK.width) {
                drawPixelArt(ctx, BRICK, x - camera.left, y - camera.top);
            }
        }
    }
}
