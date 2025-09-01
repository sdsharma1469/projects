/*
    Lightweight Process (Green Thread)
*/

class Process {
    /* 
        Initiates the process
    */
    static pid = 0;
    constructor(handlerFn, ...args){
        /*
            Handler Generator
        */
        this.handler = handlerFn.apply(this, args);
        
        /* 
            Process ID (assign the pid to the static Process pid)
        */
        this.pid = ++Process.pid;

        /* 
            Process Name
        */
        this.name = handlerFn.name || this.pid;

    }

    /* 
        String Representation
    */
    ToString(){
        return `#${this.pid} (${this.name})`
    }
}

module.exports= {
    Process,
}