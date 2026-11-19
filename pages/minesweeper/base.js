export const CellEnum = {
    unknown: -1,
    flag: -2,
    bomb: -3,
};

export class Cell {
    constructor() {
        this.data = CellEnum.unknown;
        this.isBomb = false;
        this.analyze = null;
    }

    clone() {
        let ret = new Cell();
        ret.data = this.data;
        ret.isBomb = this.isBomb;
        ret.analyze = this.analyze;
        return ret;
    }
}

export class MatrixBase {
    constructor(size) {
        this.size = size;
        this.center = [0, 0];
    }

    neighbor(index) {
        return [];
    }

    allIndex() {
        return [];
    }

    cell(index) {
        return null;
    }

    isCenter(index) {
        return false;
    }

    clone() {
        return new MatrixBase(this.size);
    }

    click(index) {}

    flag(index) {}

    open(index) {}
}

export class QuadMatrix extends MatrixBase {
    constructor(size) {
        super(size);
        this.data = [];
        for (let r = 0; r < size[1]; r++) {
            let row = [];
            for (let c = 0; c < size[0]; c++) {
                let cell = new Cell();
                cell.analyze = new Set([false, true]);
                row.push(cell);
            }
            this.data.push(row);
        }
        this.center = [Math.floor(size[0] / 2), Math.floor(size[1] / 2)];
    }

    neighbor(index) {
        let result = [];
        const subIndex = [-1, 0, 1];
        for (let r of subIndex) {
            let subR = index[1] + r;
            if (subR >= this.size[1] || subR < 0) {
                continue;
            }
            for (let c of subIndex) {
                let subC = index[0] + c;
                if (subC >= this.size[0] || subC < 0) {
                    continue;
                }
                if (r == 0 && c == 0) {
                    continue;
                }
                result.push([subC, subR]);
            }
        }
        return result;
    }

    allIndex() {
        let result = [];
        for (let r = 0; r < this.size[1]; r++) {
            for (let c = 0; c < this.size[0]; c++) {
                result.push([c, r]);
            }
        }
        return result;
    }

    cell(index) {
        return this.data[index[1]][index[0]];
    }

    isCenter(index) {
        return index[0] == this.center[0] && index[1] == this.center[1];
    }

    clone() {
        let ret = new QuadMatrix(this.size);
        for (let r = 0; r < this.size[1]; r++) {
            for (let c = 0; c < this.size[0]; c++) {
                ret.data[r][c] = this.data[r][c].clone();
            }
        }
        return ret;
    }

    click(index) {
        let cell = this.cell(index);
        if (cell.data >= 0) {
            return;
        }
        if (cell.isBomb) {
            cell.data = CellEnum.bomb;
        } else {
            let neighbors = this.neighbor(index);
            let count = 0;
            for (let i of neighbors) {
                if (this.cell(i).isBomb) {
                    count += 1;
                }
            }
            cell.data = count;
        }
    }

    flag(index) {
        if (this.cell(index).data == CellEnum.unknown) {
            this.cell(index).data = CellEnum.flag;
        } else if (this.cell(index).data == CellEnum.flag) {
            this.cell(index).data = CellEnum.unknown;
        }
    }

    open(index) {
        let cell = this.cell(index);
        if (cell.data < 0) {
            return;
        }
        let bombs = 0;
        let neighbors = this.neighbor(index);
        for (let i of neighbors) {
            if (this.cell(i).data == CellEnum.flag) {
                bombs += 1;
            }
        }
        if (bombs < cell.data) {
            return;
        }
        const next = [];
        for (let i of neighbors) {
            if (this.cell(i).data == CellEnum.unknown) {
                this.click(i);
                if (this.cell(i).data == 0) {
                    next.push(i);
                }
            }
        }
        for (let i of next) {
            this.open(i);
        }
    }
}

function shuffle(items) {
    let list = items.map(it => [Math.random(), it]);
    return list.sort((a, b) => a[0] - b[0]).map(it => it[1]);
}

function solve(mat, n, depth) {

const debugViz = (data) => {
    let debug = "";
    for (let r = 0; r < data.data.length; r++) {
        let row = data.data[r];
        for (let c = 0; c < row.length; c++) {
            let cell = row[c];
            const neighbors = data.neighbor([c, r]);
            if (cell.analyze.size != 1) {
                debug += "*";
            } else if (cell.isBomb) {
                debug += "x";
            } else {
                let bombs = 0;
                for (const n of neighbors) {
                    const nCell = data.cell(n);
                    if (nCell.isBomb) {
                        bombs += 1;
                    }
                }
                debug += bombs;
            }
        }
        debug += "\n";
    }
    console.log(debug);
}
    const data = mat.clone();
    const indices = data.allIndex();
    const newN = n;
    while (true) {
        let solved = 0;
        for (let index of indices) {
            const cell = data.cell(index);
            if (cell.analyze.size == 0) {
                return 0;
            } else if (cell.analyze.size == 1 && cell.analyze.has(false)) {
                const neighbors = data.neighbor(index);
                const nCells = neighbors.map(it => data.cell(it));
                let bombs = nCells.filter(c => c.isBomb).length;
                let flags = nCells.filter(c => c.analyze.size == 1 && c.analyze.has(true)).length;
                let unflags = nCells.filter(c => c.analyze.size == 1 && c.analyze.has(false)).length;
                if (bombs == flags) {
                    for (const n of neighbors) {
                        const nCell = data.cell(n);
                        if (nCell.analyze.size != 1) {
                            nCell.analyze.delete(true);
                            solved += 1;
                        }
                    }
                } else if (bombs + unflags == neighbors.length) {
                    for (const n of neighbors) {
                        const nCell = data.cell(n);
                        if (nCell.analyze.size != 1) {
                            nCell.analyze.delete(false);
                            solved += 1;
                        }
                    }
                }
            }
        }
        if (solved == 0) {
            break;
        }
    }
    let found = 0;
    let unsolved = [];
    for (let index of indices) {
        const cell = data.cell(index);
        if (cell.analyze.size == 2) {
            unsolved.push(index);
        } else if (cell.analyze.has(true)) {
            found += 1;
        }
    }
    if (unsolved.length == 0 || found == n) {
        return 1;
    }
    // TODO: test mode not deep
    // if (depth > 20) {
    //     return 0;
    // }
    let result = 0;
    while (true) {
        data.cell(unsolved[0]).analyze = new Set([false]);
        result += solve(data, n, depth + 1);
        if (result >= 2) {
            break;
        }
        data.cell(unsolved[0]).analyze = new Set([true]);
        result += solve(data, n, depth + 1);
    }
    data.cell(unsolved[0]).analyze = new Set([false, true]);
    console.log(depth);
    return result;
}

function initMatrixImpl(mat, bombs) {
    let indices = shuffle(mat.allIndex());
    let newBombs = [];
    const centers = new Set(mat.neighbor(mat.center).map(it => JSON.stringify(it)));
    for (let item of indices) {
        if (mat.cell(item).isBomb || mat.isCenter(item) || centers.has(JSON.stringify(item))) {
            continue;
        }
        mat.cell(item).isBomb = true;
        newBombs.push(item);
        if (newBombs.length == bombs) {
            break;
        }
    }
    const n = solve(mat, bombs, 0);
    if (n == 0) {
        newBombs.forEach(i => {
            mat.cell(i).isBomb = false;
        });
    }
    return n != 0;
    // TODO: check valid and bin-split
}

export function initMatrix(mat, bombs) {
    mat.cell(mat.center).analyze.delete(true);
    let trys = 0;
    while(true) {
        trys += 1;
        if (initMatrixImpl(mat, bombs)) {
            console.log('try times', trys);
            break;
        }
        console.log('retry');
    }
}
