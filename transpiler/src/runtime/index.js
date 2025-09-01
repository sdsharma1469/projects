const {Scheduler} = require('../Scheduler')

/*
    GLOBAL SCHEDULER 
*/
const scheduler = new Scheduler();

//Start scheduling processes as soon as runtime begins
scheduler.start(); 

/*
    spawn(fn, ...args)
    - creates a process with function fn and args 
*/
function spawn(fn, ...args){
    return scheduler.spawn(fn, ...args);
}   

/*
    print()
    - Prints to console
*/
function print(...arguments){
    console.log(...arguments);
}

/* 
    Sleep(ms)
    - Sleeps for ms miliseconds
*/
async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}


module.exports ={
    print, spawn, scheduler, sleep
} 