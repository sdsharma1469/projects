const { evaMPP } = require('../src/evaMpp');
const { exec } = require('child_process');
const path = require('path');

const eva = new evaMPP();

console.log("\n----------------");
console.log("PARSING TEST : ");

// Compile
let { ast: ast4, target: target4 } = eva.compile(`
    (var data (list 1 2 3))
    (var myRecord (rec (x 1) (y 2)))
    (print (idx data 0))
    (print (prop myRecord x))
`);

console.log("----------------");
console.log("Compiled AST : ");
// JS AST
console.log(JSON.stringify(ast4, null, 2));

console.log("----------------");
console.log("Compiled code : \n");
// JS Code
console.log(target4);

console.log("\n----------------");
console.log("Result : \n");
