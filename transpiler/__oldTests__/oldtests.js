const { evaMPP } = require('../src/evaMpp');

const eva = new evaMPP();

console.log("----------------");
console.log("INTEGER TEST : ");
let { ast, target } = eva.compile(42);

console.log("----------------");
console.log("Compiled AST : ");
// JS AST
console.log(JSON.stringify(ast, null, 2));

console.log("----------------");
console.log("Compiled code : ");
// JS Code
console.log(target);

console.log("\n----------------");
console.log("STRING TEST : ");
// Rename destructured values so they don't clash with the first test
let { ast: ast2, target: target2 } = eva.compile('"Hello"');

console.log("----------------");
console.log("Compiled AST : ");
// JS AST
console.log(JSON.stringify(ast2, null, 2));

console.log("----------------");
console.log("Compiled code : ");
// JS Code
console.log(target2);

console.log("\n----------------");
console.log("BLOCK TEST : ");

// Original input
const input = ['begin', 42, '"hello"'];

// Compile
let { ast: ast3, target: target3 } = eva.compile(input);

console.log("----------------");
console.log("Original Input : ");
console.log(JSON.stringify(input, null, 2));   // pretty-print input

console.log("----------------");
console.log("Compiled AST : ");
// JS AST
console.log(JSON.stringify(ast3, null, 2));

console.log("----------------");
console.log("Compiled code : \n");
// JS Code
console.log(target3);


   // (var user-name "John")
    // (print "user = " user-name)

    // (set user-name "Alex")
    // (print "user = " user-name)
    // (print (Number "1"))

    // (var x 32)
    // (var y (* 5 (+ x 10)))
    // (print (- y))

    // (print(not(and (> x 0) (> x 10))))

    // (var x 42)

    // (if (== x 42)
    //     (print "hellya")
    //     (print "hellna"))

    // (var i 5)
    // (while (> i 0)
    //     (begin
    //         (print "i = " i)
    //         (-- i)
    //     )
    // )

    // (for (var j 5)(< j 10)(j ++)
    //     (print j)
    // )

    // (def squareX (x) (* x x))
    // (print(squareX 2))
    
    // (def handle(id)
    //     (begin
    //         (print id 1)
    //         (print id 2)
    //     )
    // )
    
    // // (handle "x")
    // // (handle "y")

    // (spawn handle "x")
    // (spawn handle "y")