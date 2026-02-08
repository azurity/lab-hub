class CellData {
    constructor(data) {
        if (typeof data === 'number') {
            this.data = data;
        } else if (data instanceof Array) {
            this.data = new Set(data);
        } else {
            this.data = null;
        }
        this.isStatic = false;
        this.wrong = false;
    }

    toString(alphabet) {
        if (typeof this.data === 'number') {
            return alphabet[this.data - 1];
        } else {
            return "";
        }
    }

    clone() {
        let ret = new CellData();
        if (typeof this.data === 'number') {
            ret.data = this.data;
        } else if (this.data instanceof Array) {
            ret.data = new Set([...this.data]);
        }
        ret.isStatic = this.isStatic;
        return ret;
    }
}

export class BoardData {
    constructor(size) {
        this.size = size;
        this.fullSize = size[0] * size[1];
        let data = [];
        for (let y = 0; y < this.fullSize; y++) {
            let line = [];
            for (let x = 0; x < this.fullSize; x++) {
                line.push(new CellData(Array.from(new Array(this.fullSize), (_, index) => index+1)));
            }
            data.push(line);
        }
        this.data = data;
    }

    clone() {
        let ret = new BoardData(this.size);
        for (let r = 0; r < this.fullSize; r++) {
            for (let c = 0; c < this.fullSize; c++) {
                ret.data[r][c] = this.data[r][c].clone();
            }
        }
        return ret;
    }
}

export class Reducer {
    constructor(rules, size) {
        if (rules.length === 0) {
            throw "at least one rule";
        }
        this.rules = [...rules];
        this.size = size;
    }

    reduce(data) {
        for (let r of this.rules) {
            if (!r(this.size)(data)) {
                return false;
            }
        }
        return true;
    }
}

export class Solver {
    constructor(reducer) {
        if (!(reducer instanceof Reducer)) {
            throw "wrong reducer";
        }
        this.reducer = reducer;
    }

    solve(data, all, rand) {
        if (!(data instanceof BoardData)) {
            throw "wrong data";
        }
        // step 0: fill
        const size = this.reducer.size[0] * this.reducer.size[1];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (typeof data.data[r][c].data !== 'number') {
                    data.data[r][c].data = new Set(Array.from(new Array(size), (_, index) => index+1));
                }
            }
        }
        // step 1: reduce
        if (!this.reducer.reduce(data)) {
            return [0, null];
        }
        // step 2: find muttable cells
        let slot = [];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (typeof data.data[r][c].data !== 'number') {
                    slot.push([r, c, data.data[r][c].data.size]);
                }
            }
        }
        if (slot.length == 0) return [1, all ? null : data.clone()];
        slot.sort((a, b) => { return a[2] - b[2]; });
        let checked = slot[0];
        // step 3: test
        let count = 0;
        const set = data.data[checked[0]][checked[1]].data;
        let cases = [];
        for (let it of set) {
            cases.push(it);
        }
        if (rand) {
            cases.sort(() => (Math.random() > .5) ? 1 : -1);
        }
        for (let it of cases) {
            data.data[checked[0]][checked[1]].data = it;
            let ret = this.solve(data, all, rand);
            if (ret[0] != 0) {
                if (!all) {
                    return ret;
                } else if (count > 1) {
                    break;
                } else {
                    count += ret[0];
                }
            }
        }
        data.data[checked[0]][checked[1]].data = set;
        return [count, null];
    }
}

export function createData(reducer) {
    if (!(reducer instanceof Reducer)) return;
    let solver = new Solver(reducer);
    let [_, result] = solver.solve(new BoardData(reducer.size), false, true);
    return result;
}

export class PuzzleIniter {
    constructor(initers, reducer, limit) {
        this.initers = initers;
        this.reducer = reducer;
        this.limit = limit;
    }

    init(data) {
        if (!(data instanceof BoardData)) return;
        let solver = new Solver(this.reducer);
        for (let i = this.initers.length - 1; i >= 0; i--) {
            if (!this.initers[i](this.reducer.size)(data, solver, this.limit)) {
                return false;
            }
        }
        return true;
    }
}
