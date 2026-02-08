import { LitElement, css, html, until, unsafeHTML } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

import { BoardData, Solver } from "./base.js";

export class SudokuCard extends LitElement {
    static properties = {
        size: {},
        selectCell: {},
        overlay: {},
        overlayExtra: {},
        overlayState: {},
        showError: {},
        dark : {},
        highlight: {},
        refresh: { attribute: false },
    };
    // Define scoped styles right with your component, in plain CSS
    static styles = css`
        :host * {
            font-family: Ubuntu;
            font-weight: bold;
        }
        .board {
            display: grid;
            border: solid 1px black;
            outline: none !important;
        }
        .dark.board {
            border-color: white;
        }
        .dark .place {
            border-color: white;
        }
        .dark .cell.static {
            color: white;
        }
        .dark .cell-base:hover {
            background-color: darkgray;
        }
        .place {
            box-sizing: border-box;
            display: grid;
            border: solid 1px black;
        }
        .cell {
            box-sizing: border-box;
            border: solid 1px gray;
            aspect-ratio: 1;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: gray;
            user-select: none;
        }
        .cell-base.highlight,
        .alphabet-cell.highlight {
            background: linear-gradient(
                135deg,
                rgba(255, 0, 0, 0.3) 10%,
                transparent 10%,
                transparent 20%,
                rgba(255, 0, 0, 0.3) 20%,
                rgba(255, 0, 0, 0.3) 30%,
                transparent 30%,
                transparent 40%,
                rgba(255, 0, 0, 0.3) 40%,
                rgba(255, 0, 0, 0.3) 50%,
                transparent 50%,
                transparent 60%,
                rgba(255, 0, 0, 0.3) 60%,
                rgba(255, 0, 0, 0.3) 70%,
                transparent 70%,
                transparent 80%,
                rgba(255, 0, 0, 0.3) 80%,
                rgba(255, 0, 0, 0.3) 90%,
                transparent 90%,
                transparent
            );
        }
        .cell.static {
            color: black;
        }
        .cell.wrong {
            color: red;
        }
        .cell-base:hover {
            background-color: lightgray;
        }
        .cell-base {
            position: relative;
        }
        .cell-base .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            word-break: break-all;
            color: green;
            user-select: none;
        }
        .cell-base .overlay-extra {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            color: green;
            user-select: none;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .alphabet {
            margin-top: 60px;
            height: 60px;
            display: grid;
            border: dashed 1px black;
        }
        .dark.alphabet {
            border-color: white;
        }
        .alphabet-cell {
            aspect-ratio: 1;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: black;
            user-select: none;
        }
        .dark .alphabet-cell {
            color: white;
        }
    `;

    constructor() {
        super();
    }

    init(size) {
        this.size = size;
        this.data = new BoardData(size);
        this.overlay = new BoardData(size);
        this.overlayExtra = new BoardData(size);
        for (let row of this.overlay.data) {
            for (let col of row) {
                col.data = new Set();
            }
        }
        for (let row of this.overlayExtra.data) {
            for (let col of row) {
                col.data = new Set();
            }
        }
    }

    press(e) {
        const fullSize = this.size[0] * this.size[1];
        const keyList = '123456789abcdef0';
        if (e.key == 'Delete') {
            let x = parseInt(this.selectCell?.dataset['x']);
            let y = parseInt(this.selectCell?.dataset['y']);
            if (!this.data.data[y][x].isStatic) {
                this.data.data[y][x].wrong = false;
                this.data.data[y][x].data = new Set(Array.from(new Array(fullSize), (_, index) => index+1));
                this.refresh = Date.now();
            }
            e.preventDefault();
        } else {
            let key = 0;
            if (keyList.slice(0, fullSize).indexOf(e.key) >= 0) {
                key = keyList.slice(0, fullSize).indexOf(e.key) + 1;
            }
            if (key != 0 && this.selectCell != null) {
                let x = parseInt(this.selectCell?.dataset['x']);
                let y = parseInt(this.selectCell?.dataset['y']);
                if (!this.data.data[y][x].isStatic) {
                    if (this.overlayState && e.ctrlKey) {
                        if (this.overlay.data[y][x].data.has(key)) {
                            this.overlay.data[y][x].data.delete(key);
                        } else {
                            this.overlay.data[y][x].data.add(key);
                        }
                        this.refresh = Date.now();
                        e.preventDefault();
                        return;
                    }
                    if (this.overlayState && e.altKey) {
                        if (this.overlayExtra.data[y][x].data.has(key)) {
                            this.overlayExtra.data[y][x].data.delete(key);
                        } else {
                            this.overlayExtra.data[y][x].data.add(key);
                        }
                        this.refresh = Date.now();
                        e.preventDefault();
                        return;
                    }
                    if (this.solver) {
                        this.data.data[y][x].data = new Set(Array.from(new Array(fullSize), (_, index) => index+1));
                        let [count, solved] = this.solver.solve(this.data.clone(), false, false);
                        this.data.data[y][x].data = key;
                        if (count == 0 || solved.data[y][x].data != key) {
                            this.data.data[y][x].wrong = true;
                        } else {
                            this.data.data[y][x].wrong = false;
                        }
                    }
                    this.refresh = Date.now();
                }
                e.preventDefault();
            }
        }
    }

    setReducer(reducer) {
        if (reducer != null) {
            this.solver = new Solver(reducer);
        } else {
            this.solver = null;
        }
    }

    mouseenter(e) {
        this.selectCell = e.target;
    }

    dblclick(e) {
        const alphabet = '123456789abcdef0';
        const item = e.currentTarget;
        let x = parseInt(item.dataset['x']);
        let y = parseInt(item.dataset['y']);
        const value = this.data.data[y][x].toString(alphabet);
        if (value == "" || value == this.highlight) {
            this.highlight = "-";
        } else {
            this.highlight = value;
        }
    }

    dblclickAlphabet(e) {
        const value = e.currentTarget.innerText.toLowerCase();
        if (value == "" || value == this.highlight) {
            this.highlight = "-";
        } else {
            this.highlight = value;
        }
    }

    render() {
        const alphabet = '123456789abcdef0';
        const fullSize = this.size[0] * this.size[1];
        let showResult = true;
        let count = new Map(alphabet.slice(0, fullSize).split('').map(c => [c, 0]));
        for (let y = 0; y < fullSize; y++) {
            for (let x = 0; x < fullSize; x++) {
                const c = this.data.data[y][x].toString(alphabet);
                if (c == "") {
                    showResult = this.showError;
                } else {
                    count.set(c, count.get(c) + 1);
                }
            }
        }
        let places = [];
        for (let p = 0; p < fullSize; p++) {
            let cells = [];
            for (let n = 0; n < fullSize; n++) {
                let px = p % this.size[0];
                let py = (p - px) / this.size[0];
                let cx = n % this.size[1];
                let cy = (n - cx) / this.size[1];
                let x = px * this.size[1] + cx;
                let y = py * this.size[0] + cy;
                let data = this.data.data[y][x];
                let overlay = new Array('', ...this.overlay.data[y][x].data).sort((a, b) => a - b).map(it => alphabet[it - 1]).join('').toUpperCase();
                let overlayExtra = new Array('', ...this.overlayExtra.data[y][x].data).sort((a, b) => a - b).map(it => alphabet[it - 1]).join('').toUpperCase();
                let showOverlay = this.overlayState && data.toString(alphabet) == "" && overlayExtra == "";
                let showOverlayExtra = this.overlayState && data.toString(alphabet) == "";
                cells.push(html`
                    <div class="cell-base ${this.highlight == data.toString(alphabet) ? 'highlight': ''}"
                            data-x="${x}"
                            data-y="${y}"
                            @mouseenter=${this.mouseenter}
                            @dblclick=${this.dblclick}>
                        <div class="overlay" style="display: ${showOverlay ? "block" : "none"};">${overlay}</div>
                        <div class="overlay-extra" style="display: ${showOverlayExtra ? "flex" : "none"};">${overlayExtra}</div>
                        <div class="cell ${data.isStatic ? "static" : ""} ${data.wrong && showResult ? "wrong" : ""}">${data.toString(alphabet).toUpperCase()}</div>
                    </div>
                `);
            }
            places.push(html`<div class="place" style="grid-template-rows: repeat(${this.size[0]}, 1fr); grid-template-columns: repeat(${this.size[1]}, 1fr);">${cells}</div>`);
        }
        return html`<div
            class="board ${this.dark ? 'dark': 'light'}"
            tabindex="-1"
            @keydown=${this.press}
            style="width: ${60 * fullSize}px; grid-template-rows: repeat(${this.size[1]}, 1fr); grid-template-columns: repeat(${this.size[0]}, 1fr);">
            ${places}
        </div>
        <div
            class="alphabet  ${this.dark ? 'dark': 'light'}"
            style="width: ${60 * fullSize}px; grid-template-columns: repeat(${fullSize}, 1fr);">
            ${alphabet.slice(0, fullSize).split('').map(c => html`<div 
                class="alphabet-cell ${c == this.highlight ? "highlight": ""}"
                style="${count.get(c) >= fullSize ? "color: gray; opacity: 0.6;" : ""}"
                @dblclick=${this.dblclickAlphabet}>
                ${c.toUpperCase()}
            </div>`)}
        </div>`;
    }

    setOverlay(overlay) {
        this.overlayState = overlay;
    }

    setShowError(showError) {
        this.showError = showError;
    }

    setTheme(dark) {
        this.dark = dark;
    }
}
customElements.define('sudoku-card', SudokuCard);
