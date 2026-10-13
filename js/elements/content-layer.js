// The HTML layer that holds the portfolio content. It has one slot per floor
// and moves with the camera so the content stays attached to its floor.
export class ContentLayer {
    constructor(element) {
        this.element = element;
        this.slots = element.querySelectorAll('.floor-slot');
        this.scale = 1;
    }

    // Put a block of text on a floor: an optional heading, then one <p> per
    // paragraph. The heading can be a string, or a list of strings and
    // { text, className } pieces to style single words. `className` lets the CSS position and style it (see
    // .text-box in style.css); include 'nes-box' for an NES dialog look.
    addTextBox(floorIndex, paragraphs, { className = '', heading = '' } = {}) {
        const box = document.createElement('div');
        box.className = `text-box ${className}`.trim();
        if (heading) {
            const h1 = document.createElement('h1');
            [].concat(heading).forEach(piece => {
                if (typeof piece === 'string') {
                    h1.append(piece);
                } else {
                    const span = document.createElement('span');
                    span.className = piece.className;
                    span.textContent = piece.text;
                    h1.append(span);
                }
            });
            box.appendChild(h1);
        }
        paragraphs.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            box.appendChild(p);
        });
        this.slots[floorIndex].appendChild(box);
        return box;
    }

    // Put groups of pills on a floor: each group gets a heading and its items
    // as pills (see .pill-groups in style.css).
    //   addPillGroups(1, [{ title: 'Tools', items: ['GIT', 'JIRA'] }])
    addPillGroups(floorIndex, groups, { className = '' } = {}) {
        const box = document.createElement('div');
        box.className = `pill-groups ${className}`.trim();
        groups.forEach(group => {
            const section = document.createElement('section');
            const heading = document.createElement('h2');
            heading.textContent = group.title;
            const list = document.createElement('ul');
            group.items.forEach(item => {
                const pill = document.createElement('li');
                pill.className = 'pill';
                pill.textContent = item;
                list.appendChild(pill);
            });
            section.append(heading, list);
            box.appendChild(section);
        });
        this.slots[floorIndex].appendChild(box);
        return box;
    }

    // Position a box on its floor, in game pixels from the floor's top-left.
    // Only the values given are set; the CSS decides the rest.
    placeBox(box, { top, height, left, width }) {
        if (top !== undefined) box.style.top = top * this.scale + 'px';
        if (height !== undefined) box.style.height = height * this.scale + 'px';
        if (left !== undefined) box.style.left = left * this.scale + 'px';
        if (width !== undefined) box.style.width = width * this.scale + 'px';
    }

    // Size the layer and its slots to match the floors.
    // artScale: game pixels per art pixel, so CSS can match pixel-art borders
    // with var(--art-pixel).
    layout(floors, worldWidth, worldHeight, scale, artScale = 1) {
        this.scale = scale;
        this.element.style.setProperty('--art-pixel', artScale * scale + 'px');
        this.element.style.width = worldWidth * scale + 'px';
        this.element.style.height = worldHeight * scale + 'px';
        floors.forEach((floor, i) => {
            const slot = this.slots[i];
            if (!slot) return;
            slot.style.top = floor.top * scale + 'px';
            slot.style.width = floor.width * scale + 'px';
            slot.style.height = (floor.groundY - floor.top) * scale + 'px';
        });
    }

    follow(camera) {
        const x = -camera.left * this.scale;
        const y = -camera.top * this.scale;
        this.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
}
