import { LitElement, css, html, until, unsafeHTML } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

import { BoardData, Solver } from "./base.js";

export class SudokuCard extends LitElement {
    static properties = {
        selectCell: {},
        overlay: {},
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
        .cell:hover {
            background-color: lightgray;
        }
    `;

    constructor() {
        super();
        this.data = new BoardData();
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
        } else {
            let key = parseInt(e.key);
            if (key >= 1 && key <= 9 && this.selectCell != null) {
                let x = parseInt(this.selectCell?.dataset['x']);
                let y = parseInt(this.selectCell?.dataset['y']);
                if (!this.data.data[y][x].isStatic) {
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
                if (this.data.data[y][x].toString() == "")
                {
                    showResult = false;
                }
            }
        }
        let overlayList = (this.overlay ?? "").split(" ").map(it => it.trim()).filter(it => it != "");
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
                cells.push(html`
                    <div 
                        class="cell ${data.isStatic ? "static" : ""} ${data.wrong && showResult ? "wrong" : ""}"
                        data-x="${x}"
                        data-y="${y}"
                        @mouseenter=${this.mouseenter}>${data.toString()}</div>
                `);
            }
            places.push(html`<div class="place">${cells}</div>`);
        }
        return html`<div class="board" tabindex="-1" @keypress=${this.press}>
            ${places}
        </div>`;
    }
}
customElements.define('sudoku-card', SudokuCard);
