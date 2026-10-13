// Keyboard and on-screen button input.
// Ask `isDown('left')` for held keys, `wasPressed('up')` for a single press.

const KEYS = {
    ArrowLeft: 'left', a: 'left',
    ArrowRight: 'right', d: 'right',
    ArrowUp: 'up', w: 'up',
    ArrowDown: 'down', s: 'down',
    ' ': 'action'
};

export class Input {
    constructor() {
        this.down = {};
        this.pressed = {};
        this.isTouch = window.matchMedia('(pointer: coarse)').matches;
        this.listenToKeyboard();
    }

    isDown(name) {
        return !!this.down[name];
    }

    wasPressed(name) {
        return !!this.pressed[name];
    }

    // Call once at the end of every frame.
    endFrame() {
        this.pressed = {};
    }

    press(name) {
        if (!this.down[name]) this.pressed[name] = true;
        this.down[name] = true;
    }

    release(name) {
        this.down[name] = false;
    }

    listenToKeyboard() {
        const nameOf = e => KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];

        window.addEventListener('keydown', e => {
            const name = nameOf(e);
            if (!name) return;
            e.preventDefault();
            this.press(name);
        });
        window.addEventListener('keyup', e => {
            const name = nameOf(e);
            if (name) this.release(name);
        });
        window.addEventListener('blur', () => {
            this.down = {};
        });
    }

    // Hook up on-screen buttons: any element inside `container` with data-key="left" etc.
    listenToButtons(container) {
        container.querySelectorAll('[data-key]').forEach(button => {
            const name = button.dataset.key;
            const release = () => {
                button.classList.remove('active');
                this.release(name);
            };
            button.addEventListener('pointerdown', e => {
                e.preventDefault();
                button.setPointerCapture(e.pointerId);
                button.classList.add('active');
                this.press(name);
            });
            button.addEventListener('pointerup', release);
            button.addEventListener('pointercancel', release);
            button.addEventListener('lostpointercapture', release);
            button.addEventListener('contextmenu', e => e.preventDefault());
        });
    }
}
