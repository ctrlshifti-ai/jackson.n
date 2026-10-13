// The game canvas. It renders at the device's full resolution so PNG pictures
// stay sharp, while all positions are given in "game pixels" (an NES-sized
// grid). One game pixel is always a whole number of real screen pixels, so
// pixel art stays crisp and even.
import { clamp } from './math.js';

export class Screen {
    constructor(canvas, { nesHeight = 240, minScale = 2, maxScale = 5 } = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nesHeight = nesHeight; // roughly how many game pixels tall the screen is
        this.minScale = minScale;   // smallest game pixel, in CSS pixels
        this.maxScale = maxScale;   // biggest game pixel, in CSS pixels
        this.pixelSize = 1;         // one game pixel, in real device pixels
        this.scale = 1;             // one game pixel, in CSS pixels
        this.width = 0;             // screen width in game pixels
        this.height = 0;            // screen height in game pixels
    }

    // Fit the canvas to the browser window.
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const deviceWidth = Math.round(window.innerWidth * dpr);
        const deviceHeight = Math.round(window.innerHeight * dpr);

        this.pixelSize = clamp(
            Math.floor(deviceHeight / this.nesHeight),
            Math.ceil(this.minScale * dpr),
            Math.floor(this.maxScale * dpr)
        );
        this.scale = this.pixelSize / dpr;
        this.width = Math.ceil(deviceWidth / this.pixelSize);
        this.height = Math.ceil(deviceHeight / this.pixelSize);

        this.canvas.width = deviceWidth;
        this.canvas.height = deviceHeight;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';

        // From here on, everything is drawn in game pixels
        this.ctx.setTransform(this.pixelSize, 0, 0, this.pixelSize, 0, 0);
    }
}
