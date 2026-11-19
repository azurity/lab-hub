import { LitElement, css, html, until, unsafeHTML } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";
import { initMatrix, CellEnum, Cell } from "./base.js";

export class MineSweeper extends LitElement {
    static properties = {
        width: { type: Number },
        height: { type: Number },
        bombs: { type: Number },
        refresh: { attribute: false },
        fin: { attribute: false },
    };
    static styles = css`
    * {
        font-family: Ubuntu;
    }
    .matrix {
        display: flex;
        flex-direction: column;
        border: 1px solid black;
    }
    .matrix > div {
        display: flex;
        flex-direction: row;
    }
    .matrix > div > div {
        width: 60px;
        height: 60px;
        border: 1px solid black;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        cursor: pointer;
    }
    .matrix > div > div > div {
        font-size: 32px;
        font-weight: bolder;
    }
    `;

    constructor() {
        super();
    }

    init(MatrixClass) {
        this.width = Math.max(this.width, 10);
        this.height = Math.max(this.height, 10);
        this.bombs = Math.max(this.bombs, Math.floor(this.width * this.height / 10));
        this.data = new MatrixClass([this.width, this.height]);
        initMatrix(this.data, this.bombs);
    }

    render() {
        let count = 0;
        const renderCell = (cell, r, c) => {
            const center = this.data.isCenter([c, r]);
            if (cell.data == CellEnum.unknown) {
                if (center) {
                    return html`<div class="material-symbols-outlined">play_arrow</div>`;
                } else if (!this.fin || !cell.isBomb) {
                    count += 1;
                    return html`<div></div>`;
                } else {
                    return html`<div class="material-symbols-outlined" style="color: gray;">bomb</div>`;
                }
            } else if (cell.data == CellEnum.flag) {
                if (!this.fin) {
                    return html`<div class="material-symbols-outlined">flag</div>`;
                } else if (cell.isBomb) {
                    return html`<div class="material-symbols-outlined">check</div>`;
                } else {
                    return html`<div class="material-symbols-outlined" style="color: red;">close</div>`;
                }
            } else if (cell.data == CellEnum.bomb) {
                this.fin = true;
                this.refreshing();
                return html`<div class="material-symbols-outlined" style="color: red;">bomb</div>`;
            } else {
                return html`<div>${cell.data}</div>`;
            }
        }
        const ret = html `
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@40,700,0,0" />
        <div class="matrix">
            ${this.data.data.map((row, r) => html`<div>
                ${row.map((cell, c) => html`<div
                    @click=${this.click}
                    @contextmenu=${this.flag}
                    @dblclick=${this.open}
                    data-x="${c}"
                    data-y="${r}"
                    >${renderCell(cell, r, c)}</div>`)}
            </div>`)}
        </div>`;
        if (count == 0 && !this.fin) {
            this.fin = true;
            setTimeout(() => {
                this.refresh = Date.now();
            }, 0);
        }
        return ret;
    }

    click(e) {
        const item = e.currentTarget;
        let x = parseInt(item.dataset['x']);
        let y = parseInt(item.dataset['y']);
        this.data.click([x, y]);
        e.preventDefault();
        this.refreshing();
    }

    flag(e) {
        const item = e.currentTarget;
        let x = parseInt(item.dataset['x']);
        let y = parseInt(item.dataset['y']);
        this.data.flag([x, y]);
        e.preventDefault();
        this.refreshing();
    }

    open(e) {
        const item = e.currentTarget;
        let x = parseInt(item.dataset['x']);
        let y = parseInt(item.dataset['y']);
        this.data.open([x, y]);
        e.preventDefault();
        this.refreshing();
    }

    refreshing() {
        setTimeout(() => {
            this.refresh = Date.now();
        }, 0);
    }
}

customElements.define("mine-sweeper", MineSweeper);
