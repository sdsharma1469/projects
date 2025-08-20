const { evaMPP } = require('../src/evaMpp');
const { exec } = require('child_process');
const path = require('path');

const eva = new evaMPP();

console.log("\n----------------");
console.log("PARSING TEST : ");

// Compile
let { ast: ast4, target: target4 } = eva.compile(`

    // (var user-name "John")
    // (print "user = " user-name)

    // (set user-name "Alex")
    // (print "user = " user-name)
    // (print (Number "1"))

    (var x 32)
    (var y (* 5 (+ x 10)))
    (print y)
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
