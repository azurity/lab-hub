import { LitElement, css, html, until, unsafeHTML } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

import { BoardData, Solver } from "./base.js";

export class SudokuCard extends LitElement {
    static properties = {
        selectCell: {},
        overlay: {},
        overlayExtra: {},
        overlayState: {},
        showError: {},
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
            grid-template-rows: 1fr 1fr 1fr;
            grid-template-columns: 1fr 1fr 1fr;
            width: calc(60px * 9);
            border: solid 1px black;
        }
        .place {
            box-sizing: border-box;
            display: grid;
            grid-template-rows: 1fr 1fr 1fr;
            grid-template-columns: 1fr 1fr 1fr;
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
    `;

    constructor() {
        super();
        this.data = new BoardData();
        this.overlay = new BoardData();
        this.overlayExtra = new BoardData();
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
        if (e.key == 'Delete') {
            let x = parseInt(this.selectCell?.dataset['x']);
            let y = parseInt(this.selectCell?.dataset['y']);
            if (!this.data.data[y][x].isStatic) {
                this.data.data[y][x].wrong = false;
                this.data.data[y][x].data = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                this.refresh = Date.now();
            }
            e.preventDefault();
        } else {
            let key = parseInt(e.key);
            if (key >= 1 && key <= 9 && this.selectCell != null) {
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
                        this.data.data[y][x].data = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
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

    render() {
        let showResult = true;
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (this.data.data[y][x].toString() == "") {
                    showResult = this.showError;
                }
            }
        }
        let places = [];
        for (let p = 0; p < 9; p++) {
            let cells = [];
            for (let n = 0; n < 9; n++) {
                let px = p % 3;
                let py = (p - px) / 3;
                let cx = n % 3;
                let cy = (n - cx) / 3;
                let x = px * 3 + cx;
                let y = py * 3 + cy;
                let data = this.data.data[y][x];
                let overlay = new Array('', ...this.overlay.data[y][x].data).sort().join('');
                let overlayExtra = new Array('', ...this.overlayExtra.data[y][x].data).sort().join('');
                let showOverlay = this.overlayState && data.toString() == "" && overlayExtra == "";
                let showOverlayExtra = this.overlayState && data.toString() == "";
                cells.push(html`
                    <div class="cell-base"
                            data-x="${x}"
                            data-y="${y}"
                            @mouseenter=${this.mouseenter}>
                        <div class="overlay" style="display: ${showOverlay ? "block" : "none"};">${overlay}</div>
                        <div class="overlay-extra" style="display: ${showOverlayExtra ? "flex" : "none"};">${overlayExtra}</div>
                        <div class="cell ${data.isStatic ? "static" : ""} ${data.wrong && showResult ? "wrong" : ""}">${data.toString()}</div>
                    </div>
                `);
            }
            places.push(html`<div class="place">${cells}</div>`);
        }
        return html`<div class="board" tabindex="-1" @keydown=${this.press}>
            ${places}
        </div>`;
    }

    setOverlay(overlay) {
        this.overlayState = overlay;
    }

    setShowError(showError) {
        this.showError = showError;
    }
}
customElements.define('sudoku-card', SudokuCard);
