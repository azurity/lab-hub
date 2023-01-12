function rule(data) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (typeof data.data[r][c].data === 'number') {
                const val = data.data[r][c].data;
                for (let i = 0; i < 9; i++) {
                    if (data.data[r][i].data instanceof Set) {
                        data.data[r][i].data.delete(val);
                        if (data.data[r][i].size == 0)
                            return false;
                    }
                    if (data.data[i][c].data instanceof Set) {
                        data.data[i][c].data.delete(val);
                        if (data.data[i][c].data.size == 0)
                            return false;
                    }
                }
                const rb = Math.floor(r / 3) * 3;
                const cb = Math.floor(c / 3) * 3;
                for (let rd = 0; rd < 3; rd++) {
                    for (let cd = 0; cd < 3; cd++) {
                        if (data.data[rb + rd][cb + cd].data instanceof Set) {
                            data.data[rb + rd][cb + cd].data.delete(val);
                            if (data.data[rb + rd][cb + cd].data.size == 0)
                                return false;
                        }
                    }
                }
            }
        }
    }
    return true;
}

function initPuzzle(data, solver) {
    let slots = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let cell = data.data[r][c];
            if (!cell.isStatic && !(cell.data instanceof Set)) {
                slots.push([r, c]);
            }
        }
    }
    slots.sort(() => (Math.random() > .5) ? 1 : -1);
    while (slots.length > 0) {
        let d = data.data[slots[0][0]][slots[0][1]].data;
        data.data[slots[0][0]][slots[0][1]].data = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        let [count, _] = solver.solve(data, true, false);
        if (count > 1) {
            data.data[slots[0][0]][slots[0][1]].data = d;
            data.data[slots[0][0]][slots[0][1]].isStatic = true;
        }
        slots = slots.slice(1);
    }
    return true;
}

export const plugin = [rule, [], initPuzzle];
