const { evaMPP } = require('../src/evaMpp');
const { exec } = require('child_process');
const path = require('path');

const eva = new evaMPP();

console.log("\n----------------");
console.log("PARSING TEST : ");

// Compile
let { ast: ast4, target: target4 } = eva.compile(`
    42
    "hello"
    (begin "hello" "world")
    
    (var user-name "YOHN")
    // print("x = " x)

    (set user-name 100)
    // print("x = " x)
`);

console.log("----------------");
console.log("Compiled AST : ");
// JS AST
console.log(JSON.stringify(ast4, null, 2));

console.log("----------------");
console.log("Compiled code : \n");
// JS Code
console.log(target4);

console.log("----------------");
console.log("Result : \n");

// run your shell script
const scriptPath = path.resolve(__dirname, '../compile-run.sh');
exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  console.log(stdout);
});
