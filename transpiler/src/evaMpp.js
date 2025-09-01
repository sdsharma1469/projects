const evaParser = require('./parser/evaParser.js');
const {JsCodeGen} = require('./JsCodeGen.js');
const {jsTransform} = require('./transform/jsTransform.js')
const fs = require('node:fs');

const jsCodeGen = new JsCodeGen({indent : 2});

class evaMPP {
    //main Method: 
    compile (program){

        /*
            Map of all functions
        */

        this._functions = {}

        /*
            parse eva into AST 
        */
        const EvaAST = evaParser.parse(`(begin ${program})`);

        /*
            Convert EVA AST into JS AST 
        */
        const JsAST = this.generateProgram(EvaAST);

        /*
            Generate JS code from AST 
        */
        const target = jsCodeGen.generate(JsAST);

        /* 
           Save to file 
        */
        this.saveToFile('./out.js' , target)

        return {ast : JsAST, target}
    }

    /*
        Saves the code to the specified file
    */
    saveToFile(filename, code){ 
        //Prologue - adding runtime environment to our code 
        const out = 
        `const{print, spawn, scheduler, sleep} = require('./src/runtime');

${code}`
        fs.writeFileSync(filename, out, 'utf-8');
    }

    /*
        generates JS AST for the entire program
    */
    generateProgram(programBlock){
        const [_tag, ...expressions] = programBlock
       
        const prevBlock = this._currentBlock;
        const body = (this._currentBlock = []);
        expressions.forEach(element => {
            body.push(this._toStatement(this.generateJsAST(element)));
        });

        this._currentBlock = prevBlock
        return {
            type : 'Program',
            body : body,
        }
    }   

    /*
        generates JS AST from Eva AST
        this is for individual blocks
    */
    generateJsAST(exp){
    console.log(exp)
    //-----------------------
    // Numbers and Strings
    //-----------------------
        if(this._isNumber(exp)){
            return {
                type : 'NumericLiteral',
                value : exp,
            };
        }
        if (this._isString(exp)){
            return{
                type : 'StringLiteral',
                value : exp.slice(1,-1)
            }
        }

    //--------------------
    // Variables
    //---------------------
        // Declaration
        if(exp[0] === 'var'){
            return {
                type : 'VariableDeclaration',
                declarations : [
                    {
                        type : 'VariableDeclarator',
                        id : this.generateJsAST(this._toVariableName(exp[1])),
                        init : this.generateJsAST(exp[2]),
                    }
                ]
            }
        }
        // Updating
        if(exp[0] === 'set'){
            return {
                type : 'AssignmentExpression',
                operator : '=',
                left : this.generateJsAST(this._toVariableName(exp[1])),
                right : this.generateJsAST(exp[2])
            }
        }

        //Access
        if(this._isVariableName(exp)){
            return {
                type: 'Identifier',
                name: this._toVariableName(exp),
            };
        }

    //---------------------
    // Operators
    //---------------------
        //Binary Operators
        if(this._isBinary(exp)){
            return {
                type : 'BinaryExpression',
                left : this.generateJsAST(exp[1]),
                operator : exp[0],
                right : this.generateJsAST(exp[2]),
            }
        }   

        if(this._isUpdateExpression(exp)){
            let prefix , argument, operator
            prefix = this._isVariableName(exp[1]);

            if(prefix){
                argument = this.generateJsAST(exp[1]);
                operator = exp[0];
            }
            else{
                argument = this.generateJsAST(exp[0]);
                operator = exp[1];
            }

            return{
                type : 'UpdateExpression',
                operator,
                prefix,
                argument
            }
        }

        //Unary Operators
        if(this._isUnary(exp)){
            let op = exp[0];
            if(exp[0]=='not') {
                op = '!';
            }
            return{
                type: 'UnaryExpression',
                operator : op,
                argument : this.generateJsAST(exp[1]),
            }
        }

        //Logical Operators
            //Logical Binary
            if(this._isLogicalBinary(exp)){
                let op;
                switch(exp[0]){
                    case 'or':
                        op = '||';
                        break;
                    case 'and':
                        op = '&&';
                        break;
                    default : 
                        throw `Unknown Logical Operator ${exp[0]}.`;
                }
                return {
                    type : 'LogicalExpression',
                    left : this.generateJsAST(exp[1]),
                    operator : op,
                    right : this.generateJsAST(exp[2]),
                }
            }



    //----------------------
    // Blocks
    //----------------------
        if (exp[0] === 'begin'){
            const [_tag, ...expressions] = exp;

            const prevBlock = this._currentBlock;

            const body = (this._currentBlock = []);
            expressions.forEach(element => {
                body.push(this._toStatement(this.generateJsAST(element)));
            });

            this._currentBlock = prevBlock;

            return {
                type : 'BlockStatement',
                body,
            }
        }
    //-----------------------
    // Branching Statements
    //-----------------------
        //If statement
        if(exp[0] === 'if'){
            return{
                type : 'IfStatement',
                test : this.generateJsAST(exp[1]),
                consequent : this._toStatement(this.generateJsAST(exp[2])),
                alternate : this._toStatement(this.generateJsAST(exp[3])),
            }
        }

        //While loop
        if(exp[0] === 'while'){
            console.log(exp)
            return{
                type : 'WhileStatement',
                test : this.generateJsAST(exp[1]),
                body : this._toStatement(this.generateJsAST(exp[2]))
            }
        }

        //For loop 
        //Just converting it into a while loop
        if(exp[0] === 'for'){
            let final;
            let init = exp[1];
            let test = exp[2];
            let update = exp[3];
            let body = exp[4];
            final =[
            'begin'
                ,init,
                ['while',
                    test,
                    ['begin',
                        body,
                        update
                    ]
                ]
            ]
            console.log(final);
            return this.generateJsAST(final)

            return{
                type : 'ForStatement',
                init : this.generateJsAST(exp[1]),
                test : this.generateJsAST(exp[2]),
                update : this.generateJsAST(exp[3]),
                body : this._toStatement(this.generateJsAST(exp[4]))
            }
        }
    //-------------------------
    // Complex Data Structures
    //-------------------------
        // LISTS 
        if(exp[0] == 'list'){
            const elements = exp.slice(1).map(elt => this.generateJsAST(elt));
            return {
                type: 'ArrayExpression',
                elements,
            }
        }

        //list indexing 
        // eg : idx p 0 
        // gives the element of p at index 0
        if(exp[0] == 'idx'){
            return{
                type : 'MemberExpression',
                computed : true,
                object : this.generateJsAST(exp[1]),
                property : this.generateJsAST(exp[2]),
            }
            
        }

    //-----------------------
    // Functions
    //-----------------------

        //Function Definition
        //(def (square(x)(* x x)))
        if(exp[0]=='def'){
            
            const id = this.generateJsAST(this._toVariableName(exp[1]));

            const params = exp[2].map(param => this.generateJsAST(param));

            let bodyExp = exp[3];

            if(!this._hasBlock(bodyExp)){
                bodyExp = ['begin', bodyExp];
            }

            const lastStatement = bodyExp[bodyExp.length-1];

            if(!this._isStatement(lastStatement) && lastStatement!= 'return'){
                bodyExp[bodyExp.length-1] = ['return', lastStatement];
            }

            const body = this.generateJsAST(bodyExp);

            const fn = {
                type :'FunctionDeclaration',
                id,
                params,
                body
            }
            this._functions[id.name] = {
                fn, 
                definingBlock : this._currentBlock,
                index : this._currentBlock.length
            }
            return fn
        }
        //Function Call eg : (square 2)
        if(Array.isArray(exp)){
            //if its just a regular function then take the name, callee and args and create a callExpression
            const fnName = this._toVariableName(exp[0]);
            const callee = this.generateJsAST(fnName);
            const args = exp.slice(1).map(arg => this.generateJsAST(arg));

            //If spawned - a lot more to do
            if(callee.name == 'spawn'){

                //first convert the name to a generator function name with an _ in front
                //eg. square to _square
                const FunctionName = args[0].name;
                const GeneratorFunctionName = `_${FunctionName}`
                //if the function has not been added to the function map already
                if(this._functions[GeneratorFunctionName] == null){
                    //take the original function, convert it into a generator, and keep it for later use
                    
                    const processFn = jsTransform.functionToAsyncGenerator(
                        this._functions[FunctionName].fn
                    );

                    //now add the generator function to the function map
                    this._functions[GeneratorFunctionName]={
                        ...this._functions[FunctionName],
                        fn : processFn,
                        index : this._functions[FunctionName].index + 1,
                    };

                    //Going into the block where the original function was defined, and adding the function there too
                    this._functions[GeneratorFunctionName].definingBlock.splice(
                        this._functions[GeneratorFunctionName],
                        0,
                        processFn
                    );
                    
                }
                args[0].name = GeneratorFunctionName;
            }
            

            return {
                type : 'CallExpression',
                callee : callee,
                arguments : args,
            }
        }


        //Return Statement
        if(exp[0] == 'return'){
            return{
                type : 'ReturnStatement',
                argument : this.generateJsAST(exp[1])
            }
        }



    //-----------------------
    // something wrong
    //-----------------------
        throw `Unexpected Expression ${JSON.stringify(exp)}.`
        
    }

    /*
        Other helper functions
    */
    _isNumber(exp){
        return typeof(exp) === 'number';
    }
    _isString(exp){
        return typeof(exp) === 'string' && exp[0] === '"' && exp[exp.length-1] === '"';
    }

    _isVariableName(exp){ 
        return typeof(exp) === 'string' && /^[+\-*/<>=a-zA-Z0-9_\.!]+$/.test(exp); 
    }

    _isStatement(exp){
        return (
            exp[0] === 'begin'|
            exp[0] === 'if'|
            exp[0] === 'while'|
            exp[0] === 'var'
        );
    }

    /*
        Has X helper functions
    */
    _hasBlock(exp){
        return exp[0]==='begin';
    }

    

    /*
        Binary and Unary Expressions
    */
    _isBinary(exp){
        if(exp.length !==3) return false;
        return (
            exp[0]==='+'||
            exp[0]==='-'||
            exp[0]==='*'||
            exp[0]==='/'||
            exp[0]==='='||
            exp[0]==='=='||
            exp[0]==='!='||
            exp[0]==='>'||
            exp[0]==='<'||
            exp[0]==='>='||
            exp[0]==='<='
        );
    }

    _isLogicalBinary(exp){
        if(exp.length !=3) return false;
        return (
            exp[0]==='and'||
            exp[0]==='or'
        );
    }    

    _isUnary(exp){
        if(exp.length !=2) return false;
        return (
            exp[0]==='not'||
            exp[0]==='-'
        );
    }

    _isUpdateExpression(exp){
        if (!Array.isArray(exp) || exp.length !== 2) return false;

        // prefix: 
        if ((exp[0] === '++' || exp[0] === '--') && this._isVariableName(exp[1])) return true;

        // postfix:
        if (this._isVariableName(exp[0]) && (exp[1] === '++' || exp[1] === '--')) return true;

        return false;
    }

    /*
        Wraps all Relevant types in a statement
    */
    _toStatement(exp){
        switch(exp.type){
            case 'StringLiteral':
            case 'NumericLiteral':
            case 'AssignmentExpression':
            case 'VariableDeclaration':
            case 'Identifier':
            case 'CallExpression':
            case 'BinaryExpression':
            case 'LogicalExpression':
            case 'UnaryExpression':
            case 'UpdateExpression':
            case 'YieldExpression':
            case 'ArrayExpression': 
            case 'MemberExpression':
                return {type : 'ExpressionStatement', expression: exp}
            default :
                return exp;
        }
    }

    /*
        Helpers to help set variable names to same format etc
    */

    _toVariableName(exp){
        return this._toJSName(exp); 
    }

    _toJSName(exp){
        return exp.replace(/-([a-z])/g, (match,letter) => letter.toUpperCase());
    }

}

module.exports = {
    evaMPP,
}