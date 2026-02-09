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

    save(clear) {
        const bits = Math.ceil(Math.log2(this.fullSize));
        const mBits = (clear ? 1 : 2);
        const bytes = Math.ceil(bits * this.fullSize * this.fullSize / 8);
        const buffer = new Uint8Array(1 + bytes + Math.ceil(mBits * this.fullSize * this.fullSize / 8));
        buffer[0] = ((clear ? 1 : 0) | this.size[0] << 1 | this.size[1] << 4);
        let base = 0;
        for (let r = 0; r < this.fullSize; r++) {
            for (let c = 0; c < this.fullSize; c++) {
                let data = 0;
                let mask = (this.data[r][c].isStatic ? 1 : 0);
                if (typeof this.data[r][c].data === 'number') {
                    data = this.data[r][c].data - 1;
                    const cell = this.data[r][c];
                    if (!clear) {
                        mask = (cell.wrong ? 3 : (cell.isStatic ? 1: 2));
                    }
                }
                const index = Math.floor((base * bits) / 8) + 1;
                const subBase = (base * bits) % 8;
                buffer[index] = buffer[index] | ((data << subBase) & 0xff);
                if (subBase + bits > 8) {
                    buffer[index + 1] = buffer[index + 1] | ((data >> (8 - subBase)) & 0xff);
                }
                const mIndex = Math.floor((base * mBits) / 8) + 1 + bytes;
                const mSubBase = (base * mBits) % 8;
                buffer[mIndex] = buffer[mIndex] | ((mask << mSubBase) & 0xff);
                if (mSubBase + mBits > 8) {
                    buffer[mIndex + 1] = buffer[mIndex + 1] | ((mask >> (8 - mSubBase)) & 0xff);
                }
                base += 1;
            }
        }
        return buffer.toBase64({ alphabet: "base64url" });
    }

    load(raw) {
        let buffer = new Uint8Array(raw.length * 3 / 4);
        buffer.setFromBase64(raw);
        const clear = (buffer[0] & 0x01) != 0;
        this.size = [(buffer[0] >> 1) & 0x07, (buffer[0] >> 4) & 0x07];
        this.fullSize = this.size[0] * this.size[1];
        let data = [];
        for (let y = 0; y < this.fullSize; y++) {
            let line = [];
            for (let x = 0; x < this.fullSize; x++) {
                line.push(new CellData(Array.from(new Array(this.fullSize), (_, index) => index+1)));
            }
            data.push(line);
        }
        this.data = data;
        const bits = Math.ceil(Math.log2(this.fullSize));
        const mBits = (clear ? 1 : 2);
        const bytes = Math.ceil(bits * this.fullSize * this.fullSize / 8);
        let base = 0;
        for (let r = 0; r < this.fullSize; r++) {
            for (let c = 0; c < this.fullSize; c++) {
                const mIndex = Math.floor((base * mBits) / 8) + 1 + bytes;
                const mSubBase = (base * mBits) % 8;
                let mask = buffer[mIndex] >> mSubBase;
                if (mSubBase + mBits > 8) {
                    mask = mask | (buffer[mIndex + 1] << (8 - mSubBase));
                }
                mask = mask & ((1 << mBits) - 1)
                if (mask != 0) {
                    const index = Math.floor((base * bits) / 8) + 1;
                    const subBase = (base * bits) % 8;
                    let data = buffer[index] >> subBase;
                    if (subBase + bits > 8) {
                        data = data | (buffer[index + 1] << (8 - subBase));
                    }
                    data = data & ((1 << bits) - 1);
                    this.data[r][c].data = data + 1;
                    if (mask == 1) {
                        this.data[r][c].isStatic = true;
                    } else if (mask == 3) {
                        this.data[r][c].wrong = true;
                    }
                }
                base += 1;
            }
        }
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
