// Helpers for making small pixel-art images in code.

// Create an offscreen image and let `draw(g)` paint on it.
export function makeImage(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext('2d'));
    return canvas;
}

// Turn rows of characters into an image, one character per pixel.
// '.' is transparent; any other character is looked up in `colors`.
// `pixelSize` makes each character a bigger square (2 = 2x2 image pixels).
export function pixelArt(rows, colors, pixelSize = 1) {
    const width = Math.max(...rows.map(row => row.length));
    return makeImage(width * pixelSize, rows.length * pixelSize, g => {
        rows.forEach((row, y) => {
            [...row].forEach((char, x) => {
                if (char === '.') return;
                g.fillStyle = colors[char];
                g.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            });
        });
    });
}

// Mirror an image left-to-right.
export function mirror(image) {
    return makeImage(image.width, image.height, g => {
        g.translate(image.width, 0);
        g.scale(-1, 1);
        g.drawImage(image, 0, 0);
    });
}
