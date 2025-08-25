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
    
    (def handle(x)
        (begin
            (print x 1)
        )
    )
    
    (handle "x")
    (handle "y")

    (spawn handle "x")
    (spawn handle "y")
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
