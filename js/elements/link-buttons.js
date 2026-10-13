// A row of NES-style link buttons (see .nes-button in style.css).
//
//   new LinkButtons(element, [{ label: 'EMAIL', href: 'mailto:me@example.com' }]);
//
// Set `newTab: true` on a link to open it in a new tab.
export class LinkButtons {
    constructor(element, links) {
        this.element = element;
        links.forEach(link => this.addButton(link));
    }

    addButton({ label, href, newTab = false }) {
        const button = document.createElement('a');
        button.className = 'nes-button';
        button.href = href;
        button.textContent = label;
        if (newTab) {
            button.target = '_blank';
            button.rel = 'noopener';
        }
        this.element.appendChild(button);
        return button;
    }
}
