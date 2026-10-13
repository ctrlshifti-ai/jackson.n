// An NES-style message box pinned to the top of the screen.
export class Hint {
    constructor(element) {
        this.element = element;
    }

    show(text) {
        this.element.textContent = text;
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
