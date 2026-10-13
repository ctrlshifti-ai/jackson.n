// The portfolio scene: a building with floors stacked top to bottom.
// Stand at any door and press Up for the previous floor or Down for the next;
// you come out of the closest door on that floor.
// This file puts the elements together and decides what happens; the elements
// themselves know how to draw and move.
import { Camera } from './engine/camera.js';
import { Timeline } from './engine/timeline.js';
import { CityBackground } from './elements/background.js';
import { Character } from './elements/character.js';
import { HERO_ART } from './elements/hero-art.js';
import { Floor } from './elements/floor.js';
import { Door } from './elements/door.js';
import { Fence } from './elements/fence.js';
import { RooftopEntrance } from './elements/rooftop-entrance.js';
import { LivingRoom } from './elements/living-room.js';
import { Street } from './elements/street.js';
import { Scooter } from './elements/scooter.js';
import { ContentLayer } from './elements/content-layer.js';
import { Hint } from './elements/hint.js';
import { INTRO_HEADING, introParagraphs, SKILLS, SKILLS_TITLE, WORK, WORK_TITLE } from './content/profile.js';

const FLOOR_COUNT = 4;
const MIN_WORLD_WIDTH = 480;  // phones see part of this and scroll sideways
const MIN_FLOOR_HEIGHT = 96;
const DOOR_MARGIN = 40;       // gap between a door and the edge of the world
const DOOR_LOOKS = { 1: 'wood' }; // door look per floor index; others are 'stone'
const STREET_FLOOR = 2;           // the street with the places I worked
const STREET_GROUND = 48;         // sidewalk + road under the street, in game pixels
// Floors that are always entered through a particular door when coming down
// from the floor above (otherwise you come out of the closest door).
const ENTRANCE_FROM_ABOVE = { [STREET_FLOOR]: 'left' }; // the street starts at its left end
const SCOOTER_GAP = 100;          // scooter parked this far right of the street's left door, in screen (CSS) pixels
const SCOOTER_ROAD_LINE = 0.45;   // how far down the road its wheels are (0 = curb, 1 = bottom)
const SPRITE_SCALE = 1.5;     // hero, doors, fence and hut: each art pixel is 1.5x1.5 game pixels
const WALL_MARGIN = 4;        // how close the hero can walk to the edge
const START_POSITION = 0.7;   // hero starts this far across the screen (0 = left, 1 = right)

export class PortfolioScene {
    constructor(screen, input) {
        this.screen = screen;
        this.input = input;

        this.camera = new Camera();
        this.timeline = new Timeline();
        this.background = new CityBackground({ parallax: 0.3 });
        this.hero = new Character({ art: HERO_ART, speed: 60, scale: SPRITE_SCALE });
        this.content = new ContentLayer(document.getElementById('overlay'));
        this.hint = new Hint(document.getElementById('hint'));
        this.content.addTextBox(0, introParagraphs(), { className: 'intro', heading: INTRO_HEADING });
        this.skills = this.content.addPillGroups(1, SKILLS, { className: 'skills' });
        this.skillsPlaque = this.content.addTextBox(1, [], { className: 'plaque', heading: SKILLS_TITLE });

        // Made once so sign pictures stay loaded; repainted to fit on every layout
        this.street = new Street({ scale: SPRITE_SCALE });
        this.street.setSign(0, 'img/sugarbox.png');
        this.street.setSign(1, 'img/grassdoor.svg');
        this.street.setSign(2, 'img/alertdriving.svg');
        // My scooter: made once so it remembers whether it's being ridden
        this.scooter = new Scooter({ scale: SPRITE_SCALE, riderArt: HERO_ART });
        this.scooterParked = false; // placed at its starting spot yet?
        this.ridePrompt = this.content.addTextBox(STREET_FLOOR,
            [input.isTouch ? 'TAP A TO RIDE' : 'PRESS SPACE TO RIDE'], { className: 'nes-box prompt' });

        // "Work experience" written on the sign boards over both street doors
        this.doorSignTexts = [0, 1].map(() =>
            this.content.addTextBox(STREET_FLOOR, [], { className: 'sign-text', heading: WORK_TITLE }));

        // Job details floating above each building
        this.workBoxes = WORK.map(job => this.content.addTextBox(
            STREET_FLOOR,
            [job.parent ? `(${job.parent})` : '', job.title, job.dates, job.location].filter(Boolean),
            { className: 'work', heading: job.company }
        ));

        this.floors = [];
        this.heroFloor = null;
        this.worldWidth = 0;
        this.worldHeight = 0;

        this.hint.show(input.isTouch ? '◀ ▶ MOVE   ▲ ▼ DOORS' : 'ARROWS: MOVE   UP/DOWN: DOORS');
    }

    /* ---------- Building the world ---------- */

    // Build (or rebuild, after a resize) everything to fit the screen.
    layout() {
        this.timeline.finish();

        const viewWidth = this.screen.width;
        const viewHeight = this.screen.height;
        const isFirstLayout = this.floors.length === 0;
        const heroFloorIndex = isFirstLayout ? 0 : this.heroFloor.index;
        const heroProgress = isFirstLayout ? 0 : this.hero.x / this.heroFloor.width;

        this.worldWidth = Math.max(viewWidth, MIN_WORLD_WIDTH); // width of a normal floor
        const floorHeight = Math.max(MIN_FLOOR_HEIGHT, viewHeight);
        this.worldHeight = floorHeight * FLOOR_COUNT;

        this.createFloors(floorHeight);
        this.createDoors();
        this.decorateRooftop();
        this.decorateLivingRoom();
        this.decorateStreet();
        const widestFloor = Math.max(...this.floors.map(floor => floor.width));
        this.background.build(viewWidth, viewHeight, widestFloor);
        this.camera.setSize(viewWidth, viewHeight, this.worldWidth, this.worldHeight);
        this.content.layout(this.floors, widestFloor, this.worldHeight, this.screen.scale, SPRITE_SCALE);
        this.content.placeBox(this.skills, this.livingRoom.emptyWall); // on the bare wall above the decorations
        this.placePlaqueAboveDoor(this.skillsPlaque, this.floors[1]);
        this.placeRidePrompt();
        this.street.doorSigns.forEach((sign, i) => {
            if (!this.doorSignTexts[i]) return;
            this.content.placeBox(this.doorSignTexts[i], { left: sign.x, top: sign.y, width: sign.width, height: sign.height });
        });
        this.workBoxes.forEach((box, i) => {
            const spot = this.street.buildingSpots[i];
            this.content.placeBox(box, {
                left: spot.x + spot.width / 2, // CSS centers it on this point
                top: spot.top - 4,             // and lifts it up by its own height
                width: spot.width
            });
        });

        // Put the hero back where they were, scaled to the new size
        this.heroFloor = this.floors[heroFloorIndex];
        const heroX = isFirstLayout ? this.startX() : Math.round(heroProgress * this.heroFloor.width);
        this.hero.placeAt(heroX, this.heroFloor.groundY);
        this.keepHeroInside();
        if (isFirstLayout) this.hero.wave(); // says hi until the visitor moves him

        this.pointCamera();
        this.camera.snap();
    }

    // Where the hero first stands: centered on START_POSITION of the screen width.
    startX() {
        return Math.round(this.screen.width * START_POSITION - this.hero.width / 2);
    }

    createFloors(floorHeight) {
        this.floors = [];
        for (let i = 0; i < FLOOR_COUNT; i++) {
            const isStreet = i === STREET_FLOOR;
            this.floors.push(new Floor({
                index: i,
                top: i * floorHeight,
                height: floorHeight,
                // The street can be longer than the screen when it has more buildings
                width: isStreet
                    ? Math.max(this.worldWidth, this.street.widthFor(this.worldWidth, DOOR_MARGIN + Door.WIDTH * SPRITE_SCALE))
                    : this.worldWidth,
                groundHeight: isStreet ? STREET_GROUND : undefined
            }));
        }
    }

    // Doors sit in pairs, one above the other, alternating right, left, right...
    // so the natural path zig-zags down the building.
    createDoors() {
        const doorWidth = Door.WIDTH * SPRITE_SCALE;

        for (let i = 0; i < FLOOR_COUNT - 1; i++) {
            const onRight = i % 2 === 0;
            const options = { arrowSide: onRight ? 'left' : 'right', scale: SPRITE_SCALE }; // arrows face into the room
            [this.floors[i], this.floors[i + 1]].forEach(floor => {
                const x = onRight ? floor.width - DOOR_MARGIN - doorWidth : DOOR_MARGIN;
                const look = DOOR_LOOKS[floor.index] || 'stone';
                floor.addDoor(new Door(x, floor, { ...options, look }));
            });
        }
    }

    // The first floor is the roof: a railing along the edge and a stair hut
    // around its door, so the door reads as the way into the building.
    decorateRooftop() {
        const roof = this.floors[0];
        roof.addScenery(new Fence(roof, { scale: SPRITE_SCALE }));
        roof.addScenery(new RooftopEntrance(roof.doors[0], { scale: SPRITE_SCALE }));
    }

    // The second floor is a living room, drawn at the hero's scale.
    decorateLivingRoom() {
        const room = this.floors[1];
        this.livingRoom = new LivingRoom({ scale: SPRITE_SCALE });
        this.livingRoom.placeOn(room);
        room.addScenery(this.livingRoom);
        room.showGround = false; // the room has its own wooden floor
    }

    // Center a plaque just above the floor's right-hand door (the way in from upstairs).
    placePlaqueAboveDoor(plaque, floor) {
        const door = floor.nearestDoor(floor.width);
        this.content.placeBox(plaque, {
            left: door.x + door.width / 2,
            top: door.y - floor.top - 6 // CSS lifts it up by its own height
        });
    }

    // The third floor is a street with the three places I worked.
    decorateStreet() {
        const floor = this.floors[STREET_FLOOR];
        this.street.placeOn(floor);
        floor.addScenery(this.street);

        // My scooter on the road, in front of the hero. It starts near the left
        // door; after that it stays wherever it was last parked.
        const road = this.street.road;
        const wheelsY = road.top + Math.round((road.bottom - road.top) * SCOOTER_ROAD_LINE);
        let x = this.scooter.x;
        if (!this.scooterParked) {
            const leftDoor = floor.nearestDoor(0);
            x = leftDoor.x + leftDoor.width + Math.round(SCOOTER_GAP / this.screen.scale);
            this.scooterParked = true;
        }
        this.scooter.placeAt(x, wheelsY);
        floor.addForeground(this.scooter);
        floor.showGround = false; // the street draws its own sidewalk and road
    }

    /* ---------- Every frame ---------- */

    update(dt) {
        this.background.update(dt);
        this.hero.update(dt);

        if (this.timeline.running) {
            this.timeline.update(dt);
        } else {
            this.moveHero(dt);
            this.checkScooter();
            if (this.hero.vehicle) this.heroFloor.doors.forEach(d => { d.highlighted = false; }); // no doors on a scooter
            else this.checkDoors();
        }
        this.pointCamera();
        this.camera.update(dt);
    }

    draw() {
        const ctx = this.screen.ctx;
        this.background.draw(ctx, this.camera);
        this.floors.forEach(floor => floor.draw(ctx, this.camera));
        this.hero.draw(ctx, this.camera);
        this.floors.forEach(floor => floor.drawForeground(ctx, this.camera));
        this.content.follow(this.camera);
    }

    /* ---------- What happens ---------- */

    moveHero(dt) {
        if (this.input.isDown('right')) {
            this.hero.moveRight(dt);
        } else if (this.input.isDown('left')) {
            this.hero.moveLeft(dt);
        } else {
            this.hero.stand();
        }
        this.keepHeroInside();
    }

    // Near the parked scooter: show the prompt, and Space gets on.
    // While riding, Space gets off and parks it there.
    checkScooter() {
        const scooter = this.scooter;
        const near = this.heroFloor.index === STREET_FLOOR && !this.hero.vehicle
            && this.hero.centerX >= scooter.x && this.hero.centerX <= scooter.x + scooter.width;
        this.ridePrompt.classList.toggle('visible', near);

        if (!this.input.wasPressed('action')) return;
        if (this.hero.vehicle) {
            this.hero.dismount();
            this.placeRidePrompt();
        } else if (near) {
            this.hero.mount(scooter);
            this.hint.hide();
        }
    }

    // Keep the prompt just above the parked scooter.
    placeRidePrompt() {
        const floor = this.floors[STREET_FLOOR];
        this.content.placeBox(this.ridePrompt, {
            left: this.scooter.centerX,
            top: this.scooter.groundY - this.scooter.height - floor.top - 4
        });
    }

    keepHeroInside() {
        this.hero.keepWithin(WALL_MARGIN, this.heroFloor.width - this.hero.width - WALL_MARGIN);
    }

    checkDoors() {
        const door = this.heroFloor.doorAt(this.hero);
        const floorAbove = this.floors[this.heroFloor.index - 1];
        const floorBelow = this.floors[this.heroFloor.index + 1];

        this.heroFloor.doors.forEach(d => {
            d.highlighted = d === door;
            d.canGoUp = !!floorAbove;
            d.canGoDown = !!floorBelow;
        });
        if (!door) return;

        if (this.input.wasPressed('up') && floorAbove) {
            this.goThroughDoor(door, floorAbove);
        } else if (this.input.wasPressed('down') && floorBelow) {
            this.goThroughDoor(door, floorBelow);
        }
    }

    // Walk into a door, scroll to the door on the other floor, walk out of it.
    goThroughDoor(door, toFloor) {
        const exitDoor = this.arrivalDoor(door, toFloor);
        door.highlighted = false;

        this.timeline
            .then(0.18, () => {
                door.open();
                this.hero.stand();
                this.hero.x = this.heroXInFrontOf(door);
                this.hero.faceAway();
            })
            .then(0.18, () => this.hero.hide())
            .then(0.12, () => door.close())
            .then(0.6, () => {
                // Hero is hidden; the camera glides to the other floor
                this.heroFloor = exitDoor.floor;
                this.hero.placeAt(this.heroXInFrontOf(exitDoor), exitDoor.floor.groundY);
            })
            .then(0.15, () => exitDoor.open())
            .then(0.18, () => {
                this.hero.show();
                this.hero.faceFront();
            })
            .then(0.12, () => {
                exitDoor.close();
                this.hint.hide();
            });
    }

    // Which door you come out of on `toFloor`: a fixed entrance when coming
    // down into a floor listed in ENTRANCE_FROM_ABOVE, otherwise the closest one.
    arrivalDoor(fromDoor, toFloor) {
        const comingDown = toFloor.index > fromDoor.floor.index;
        const entrance = comingDown && ENTRANCE_FROM_ABOVE[toFloor.index];
        if (entrance === 'left') return toFloor.nearestDoor(0);
        if (entrance === 'right') return toFloor.nearestDoor(toFloor.width);
        return toFloor.nearestDoor(fromDoor.x);
    }

    // The x that puts the hero in the middle of a door.
    heroXInFrontOf(door) {
        return door.x + (door.width - this.hero.width) / 2;
    }

    pointCamera() {
        this.camera.worldWidth = this.heroFloor.width; // each floor scrolls only as far as it's wide
        this.camera.lookAt(this.hero.centerX, this.heroFloor.middleY);
    }
}
