// Decides which part of the world is on screen. Glides smoothly toward
// whatever it was told to look at, without going past the world's edges.
import { clamp } from './math.js';

export class Camera {
    constructor({ smoothness = 6 } = {}) {
        this.smoothness = smoothness;  // higher = snappier
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.viewWidth = 0;
        this.viewHeight = 0;
        this.worldWidth = 0;
        this.worldHeight = 0;
    }

    setSize(viewWidth, viewHeight, worldWidth, worldHeight) {
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }

    // Center the view on a point in the world.
    lookAt(x, y) {
        this.targetX = clamp(x - this.viewWidth / 2, 0, Math.max(0, this.worldWidth - this.viewWidth));
        this.targetY = clamp(y - this.viewHeight / 2, 0, Math.max(0, this.worldHeight - this.viewHeight));
    }

    // Jump straight to the target instead of gliding.
    snap() {
        this.x = this.targetX;
        this.y = this.targetY;
    }

    update(dt) {
        const step = 1 - Math.exp(-this.smoothness * dt);
        this.x += (this.targetX - this.x) * step;
        this.y += (this.targetY - this.y) * step;
    }

    // Whole-pixel position, used when drawing so pixels stay sharp.
    get left() {
        return Math.round(this.x);
    }

    get top() {
        return Math.round(this.y);
    }

    canSee(top, bottom) {
        return bottom > this.top && top < this.top + this.viewHeight;
    }
}
