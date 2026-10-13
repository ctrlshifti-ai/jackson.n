// A character that walks left and right, faces away (into a door), hides and
// shows. It looks at the viewer while standing still (and breathes), turns to
// the side while walking, and can wave until it next moves.
//
// Its look comes from pixel art (`art`, see hero-art.js for the format):
//
//   new Character({ art: HERO_ART })   // from hero-art.js
//
// or from a single high-resolution PNG, which has no poses or animation:
//
//   new Character({ picture: 'img/hero.png', width: 20, height: 48 })
import { pixelArt, mirror } from '../engine/pixels.js';
import { drawPixelArt, drawPicture, loadImage } from '../engine/draw.js';
import { breathe } from '../engine/math.js';

// Frames are built at double resolution so fine details (like the beard) can
// use pixels half the normal size. Normal pixels become 2x2 blocks.
const DETAIL = 2;

// Draw the half-size face details on top of a front-facing frame.
// `shiftX`/`shiftY` move them along with the head (in game pixels).
function addFaceDetail(image, art, shiftX = 0, shiftY = 0) {
    const face = art.faceDetail;
    if (!face) return image;
    const details = pixelArt(face.rows, art.colors);
    image.getContext('2d').drawImage(details, (face.x + shiftX) * DETAIL, (face.y + shiftY) * DETAIL);
    return image;
}

// Breathing out: everything above the chest sinks one pixel.
function breathingOut(rows, chestRow) {
    return ['', ...rows.slice(0, chestRow), ...rows.slice(chestRow + 1)];
}

const SWING = 3;      // how far a foot swings forward or back, in pixels
const SHOE_ROWS = 3;  // bottom rows of each leg that move as one piece

// One walk cycle: legs apart, passing, legs apart the other way, passing.
// Positive = front leg forward, back leg behind.
const WALK_CYCLE = [SWING, 0, -SWING, 0];

// Build one side-view walking pose (as pixel rows) from the body and legs.
// Each leg swings from the hip: the lower the row, the further it moves.
// When the legs are apart the body sits one pixel lower, like a real step,
// and the feet always stay on the ground.
function sideWalkPose(art, swing) {
    const bodyWidth = Math.max(...art.side.map(row => row.length));
    const width = bodyWidth + SWING * 2; // room for feet to swing out
    const height = art.side.length + art.sideFrontLeg.length;
    const drop = swing === 0 ? 0 : 1;
    const grid = Array.from({ length: height }, () => Array(width).fill('.'));

    function paint(rows, left, top, shiftForRow) {
        rows.forEach((row, i) => {
            [...row].forEach((char, x) => {
                const gx = left + x + shiftForRow(i);
                const gy = top + i;
                if (char !== '.' && gx >= 0 && gx < width && gy < height) grid[gy][gx] = char;
            });
        });
    }

    function paintLeg(rows, legX, legSwing) {
        const kneeToShoe = rows.length - SHOE_ROWS - 1;
        const visibleRows = rows.slice(drop); // lowered body hides the hip row
        paint(visibleRows, SWING + legX, art.side.length + drop, i => {
            const along = Math.min(1, (i + drop) / kneeToShoe); // 0 at hip, 1 at hem
            return Math.round(along * legSwing);
        });
    }

    paintLeg(art.sideBackLeg, art.sideLegX.back, -swing);
    paintLeg(art.sideFrontLeg, art.sideLegX.front, swing);
    paint(art.side, SWING, drop, () => 0);

    return grid.map(row => row.join(''));
}

// Turn the art into every image the character needs.
function makeFrames(art) {
    const draw = rows => pixelArt(rows, art.colors, DETAIL);
    const front = addFaceDetail(draw(art.front), art);
    const breathing = addFaceDetail(draw(breathingOut(art.front, art.chestRow ?? 17)), art, 0, 1);
    // Waving frames have extra empty columns on each side
    const waveShift = rows => (rows[0].length - art.front[0].length) / 2;
    const walkRight = WALK_CYCLE.map(swing => draw(sideWalkPose(art, swing)));
    return {
        standing: front,
        breathing: breathing,
        walkRight: walkRight,
        walkLeft: walkRight.map(mirror),
        waving: (art.frontWaving || []).map(rows => addFaceDetail(draw(rows), art, waveShift(rows))),
        away: draw(art.back)
    };
}

export class Character {
    constructor({
        art = null,
        picture = null,
        width = 20,
        height = 48,
        speed = 60,
        animationFps = 10,
        breathSeconds = 2.4,
        waveFps = 4,
        scale = 1
    } = {}) {
        this.frames = picture ? null : makeFrames(art);
        this.picture = picture ? loadImage(picture) : null;
        this.scale = scale;               // 2 = every art pixel is 2x2 game pixels
        this.width = width * scale;       // used for collisions and centering
        this.height = height * scale;
        this.speed = speed * scale;       // game pixels per second (bigger = longer strides)
        this.animationFps = animationFps; // walk frames per second
        this.breathSeconds = breathSeconds;
        this.waveFps = waveFps;           // wave frames per second

        this.x = 0;
        this.groundY = 0;                 // y of the ground under the feet
        this.facing = 'front';            // 'front' | 'left' | 'right' | 'away'
        this.walking = false;
        this.walkTime = 0;
        this.waving = false;
        this.visible = true;
        this.time = 0;
        this.vehicle = null;              // something being ridden (see mount)
    }

    // Get on a vehicle (e.g. a Scooter): it moves the character faster and
    // draws them riding it.
    mount(vehicle) {
        this.vehicle = vehicle;
        vehicle.ridden = true;
        this.waving = false;
        this.facing = 'right';
    }

    // Get off and leave the vehicle parked where the character is.
    dismount() {
        const vehicle = this.vehicle;
        vehicle.ridden = false;
        vehicle.placeAt(this.centerX - vehicle.width / 2, vehicle.groundY);
        this.vehicle = null;
        this.facing = 'front';
        return vehicle;
    }

    get currentSpeed() {
        return this.speed * (this.vehicle ? this.vehicle.speedBoost : 1);
    }

    update(dt) {
        this.time += dt;
    }

    get centerX() {
        return this.x + this.width / 2;
    }

    placeAt(x, groundY) {
        this.x = x;
        this.groundY = groundY;
    }

    moveRight(dt) {
        this.x += this.currentSpeed * dt;
        this.facing = 'right';
        this.walk(dt);
    }

    moveLeft(dt) {
        this.x -= this.currentSpeed * dt;
        this.facing = 'left';
        this.walk(dt);
    }

    walk(dt) {
        this.waving = false;
        this.walking = true;
        this.walkTime += dt;
    }

    // Stop walking and turn to face the viewer.
    stand() {
        this.walking = false;
        this.walkTime = 0;
        if (this.facing !== 'away' && !this.vehicle) this.facing = 'front'; // riders keep facing the road
    }

    keepWithin(minX, maxX) {
        this.x = Math.max(minX, Math.min(maxX, this.x));
    }

    faceFront() {
        this.facing = 'front';
    }

    // Wave at the viewer. Stops as soon as the character walks.
    wave() {
        this.waving = true;
        this.facing = 'front';
    }

    faceAway() {
        this.facing = 'away';
    }

    hide() {
        this.visible = false;
    }

    show() {
        this.visible = true;
    }

    // Which pixel-art image to show right now.
    currentFrame() {
        const frames = this.frames;
        if (this.facing === 'away') return frames.away;
        if (this.walking) {
            const walkFrames = this.facing === 'left' ? frames.walkLeft : frames.walkRight;
            const step = Math.floor(this.walkTime * this.animationFps) % walkFrames.length;
            return walkFrames[step];
        }
        if (this.waving && frames.waving.length > 0) {
            const step = Math.floor(this.time * this.waveFps) % frames.waving.length;
            return frames.waving[step];
        }
        return breathe(this.time, this.breathSeconds) > 0.5 ? frames.breathing : frames.standing;
    }

    draw(ctx, camera) {
        if (!this.visible) return;
        if (this.vehicle) {
            this.vehicle.drawWithRider(ctx, camera, this);
            return;
        }
        const x = this.x - camera.left;
        const y = this.groundY - this.height - camera.top;

        if (this.picture) {
            drawPicture(ctx, this.picture, x, y, this.width, this.height, this.facing === 'left');
            return;
        }

        // Poses can differ in width, so center each one on the character
        const frame = this.currentFrame();
        const drawScale = this.scale / DETAIL;
        const frameWidth = frame.width * drawScale;
        const frameHeight = frame.height * drawScale;
        const frameX = x + (this.width - frameWidth) / 2;
        const frameY = this.groundY - frameHeight - camera.top;
        drawPixelArt(ctx, frame, frameX, frameY, drawScale);
    }
}
