const{print, spawn} = require('./src/runtime');


function handle(x) {
  return(print(x,1));
}

handle("x");
handle("y");
spawn(handle,"x");
spawn(handle,"y");