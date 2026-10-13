// A static high-resolution PNG standing in the world (a person, a sign, a prop).
// Size is in game pixels; the image is drawn smoothly at full screen resolution.
//
//   const friend = new Picture('img/friend.png', { width: 24, height: 40 });
//   friend.placeAt(120, floor.groundY);
//   ...
//   friend.draw(ctx, camera);
import { drawPicture, loadImage } from '../engine/draw.js';

export class Picture {
    constructor(src, { width, height, flip = false }) {
        this.image = loadImage(src);
        this.width = width;
        this.height = height;
        this.flip = flip;   // mirror left-to-right
        this.x = 0;
        this.groundY = 0;   // y of the ground it stands on
    }

    placeAt(x, groundY) {
        this.x = x;
        this.groundY = groundY;
    }

    draw(ctx, camera) {
        const x = this.x - camera.left;
        const y = this.groundY - this.height - camera.top;
        drawPicture(ctx, this.image, x, y, this.width, this.height, this.flip);
    }
}
