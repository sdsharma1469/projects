/* 
    Process Scheduler
*/

const {Process} = require('./Process')

class Scheduler{
    /*
        Scheduler Class to implement Round Robin Scheduling
    */
    constructor(){
        /* 
            Set of all processes 
        */
        this.processes = new Set();

        /* 
            All the alive processes 
        */
        this.runQueue = [];
    }

    /* 
        Spawns a new process with the handlerFn 
    */
    spawn(handlerFn, ...args){
        const process = new Process(handlerFn, ...args);
        this.processes.add(process)
        console.log(`* Spawning a new process ${process.ToString()}`);
        this.schedule(process);
        return process
    }

    /*
        Sleep function
    */
    async sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    /* 
        Adds the process to the queue 
    */
    schedule(process){
        this.runQueue.push(process);
    }

    terminate(process){
        console.log(`Process ${process} terminated`)
        this.processes.delete(process)
    }

    /* 
        Handles all yield points of one single process
    */
    async handleProcess(process){
        try{
            for await (let step of process.handler){}
        }
        catch(e){
            console.log(
                `*Process ${process} threw an exception "${e}", terminating.`
            );
        }
        this.terminate(process)
    }

    /* 
        Main run loop
    */
    async run(){
        while(true){
            //run all processes 
            if(this.runQueue.length > 0){
                Promise.all(this.runQueue.map(process => this.handleProcess(process)));

                //Flush the queue
                this.runQueue.length = 0;
            }
            await this.sleep(10);
        }
    }
    // Start the scheduler
    async start(){
        setTimeout(()=>this.run(), 0)
    }
}

module.exports = {
    Scheduler
}