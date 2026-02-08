function rule(size) {
    return function (data) {
        const fullSize = size[0] * size[1];
        for (let r = 0; r < fullSize; r++) {
            for (let c = 0; c < fullSize; c++) {
                if (typeof data.data[r][c].data === 'number') {
                    const val = data.data[r][c].data;
                    for (let i = 0; i < fullSize; i++) {
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
                    const rb = Math.floor(r / size[0]) * size[0];
                    const cb = Math.floor(c / size[1]) * size[1];
                    for (let rd = 0; rd < size[0]; rd++) {
                        for (let cd = 0; cd < size[1]; cd++) {
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
}

function initPuzzle(size) {
    return function (data, solver, limit) {
        const fullSize = size[0] * size[1];
        let slots = [];
        for (let r = 0; r < fullSize; r++) {
            for (let c = 0; c < fullSize; c++) {
                let cell = data.data[r][c];
                if (!cell.isStatic && !(cell.data instanceof Set)) {
                    slots.push([r, c]);
                }
            }
        }
        slots.sort(() => (Math.random() > .5) ? 1 : -1);
        let staticCount = 0;
        while (slots.length > 0 && slots.length + staticCount > limit) {
            console.log(slots.length + staticCount);
            let d = data.data[slots[0][0]][slots[0][1]].data;
            data.data[slots[0][0]][slots[0][1]].data = new Set(Array.from(new Array(fullSize), (_, index) => index+1));
            let [count, _] = solver.solve(data, true, false);
            if (count > 1) {
                data.data[slots[0][0]][slots[0][1]].data = d;
                data.data[slots[0][0]][slots[0][1]].isStatic = true;
                staticCount += 1;
            }
            slots = slots.slice(1);
        }
        while (slots.length > 0) {
            data.data[slots[0][0]][slots[0][1]].isStatic = true;
            slots = slots.slice(1);
        }
        return true;
    }
}

export const plugin = [rule, [], initPuzzle];
