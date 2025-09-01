function print(...args){
    console.log(...args)
}

const RunQueue = [];

async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

function spawn(fn, ...args){
    const gen = fn(...args)
    schedule(gen)
}

function schedule(gen){
    RunQueue.push(gen);
}

async function handleProcess(gen){
    for await (let step of gen){}
}
function schedulerLoop(){
    /* Manual Round Robin Scheduling */

        // while (RunQueue.length > 0){
        //     const gen = RunQueue.shift();
        //     const result = gen.next();

        //     if(!result.done){
        //         schedule(gen)
        //     }
        // }

    /* Using Promises */

        Promise.all(RunQueue.map(gen => handleProcess(gen)));
        RunQueue.length = 0;
}

async function* _handle(id, ms){
    print(id,1)
    yield await sleep(ms) ;
    print(id,2)
    yield await sleep(ms) ;
    print(id,3)
}

spawn(_handle, 'x', 300)
spawn(_handle, 'y', 3000)

schedulerLoop()