// Two ways to put an image on screen:
//   drawPixelArt - NES-style art, blocky and snapped to whole game pixels
//   drawPicture  - high-resolution PNGs, smooth and full detail
// Both take positions in game pixels; the screen handles scaling.

// `scale` is how many game pixels each image pixel covers: 2 draws it twice as
// big, 0.5 draws art made at double resolution at its normal size.
export function drawPixelArt(ctx, image, x, y, scale = 1) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, Math.round(x), Math.round(y), image.width * scale, image.height * scale);
}

export function drawPicture(ctx, image, x, y, width, height, flip = false) {
    if (!image.complete || !image.naturalWidth) return; // still loading
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (flip) {
        ctx.save();
        ctx.translate(x + width, y);
        ctx.scale(-1, 1);
        ctx.drawImage(image, 0, 0, width, height);
        ctx.restore();
    } else {
        ctx.drawImage(image, x, y, width, height);
    }
}

// A single game pixel, optionally see-through (alpha 0..1).
export function drawDot(ctx, x, y, color, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    ctx.globalAlpha = 1;
}

// Start loading a PNG (or any image file). It draws once it has loaded.
export function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}
