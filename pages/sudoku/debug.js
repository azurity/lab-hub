
import { Reducer, createData, PuzzleIniter } from "./base.js";
import { plugin as commonP } from "./commonRule.js";

let reducer = new Reducer([commonP[0]]);
let initer = new PuzzleIniter([commonP[2]], reducer);

// const sudoku = document.createElement("sudoku-card");
// sudoku.setAttribute("overlay", "a b c");
let data = createData(reducer);
debugger
initer.init(data);
debugger
// sudoku.data = data;
// document.body.appendChild(sudoku);
