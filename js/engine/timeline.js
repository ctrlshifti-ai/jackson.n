// Runs actions one after another with pauses in between.
//
//   timeline
//       .then(0.2, () => door.open())     // do this, then wait 0.2s
//       .then(0.2, () => hero.hide());
export class Timeline {
    constructor() {
        this.steps = [];
        this.waiting = 0;
    }

    get running() {
        return this.steps.length > 0 || this.waiting > 0;
    }

    then(seconds, action) {
        if (!this.running) this.waiting = 0;
        this.steps.push({ seconds, action });
        return this;
    }

    update(dt) {
        if (!this.running) return;
        this.waiting -= dt;
        while (this.waiting <= 0 && this.steps.length > 0) {
            const step = this.steps.shift();
            step.action();
            this.waiting += step.seconds;
        }
    }

    // Run every remaining step right now.
    finish() {
        while (this.steps.length > 0) this.steps.shift().action();
        this.waiting = 0;
    }
}
