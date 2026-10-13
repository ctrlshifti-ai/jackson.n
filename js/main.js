// Starts the game: sets up the screen and input, loads the scene, runs the loop.
import { Screen } from './engine/screen.js';
import { Input } from './engine/input.js';
import { PortfolioScene } from './scene.js';
import { LinkButtons } from './elements/link-buttons.js';
import { LINKS } from './content/profile.js';

const screen = new Screen(document.getElementById('game'));
const input = new Input();
input.listenToButtons(document.getElementById('dpad'));
input.listenToButtons(document.getElementById('action-pad'));

const scene = new PortfolioScene(screen, input);

// Fixed on screen, the same for every scene
new LinkButtons(document.getElementById('links'), LINKS);

function resize() {
    screen.resize();
    scene.layout();
}
window.addEventListener('resize', resize);
resize();

let lastTime = performance.now();

function gameLoop(now) {
    // Seconds since the last frame, capped. The very first frame's timestamp can
    // be slightly earlier than lastTime, so never let it go below zero.
    const dt = Math.max(0, Math.min((now - lastTime) / 1000, 0.05));
    lastTime = now;

    scene.update(dt);
    scene.draw();
    input.endFrame();

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
