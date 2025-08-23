const evaParser = require('./parser/evaParser.js');
const {JsCodeGen} = require('./JsCodeGen.js');
const fs = require('node:fs');

const jsCodeGen = new JsCodeGen({indent : 2});

class evaMPP {
    //main Method: 
    compile (program){
        /*
            TODO : parse eva into AST 
        */
        const EvaAST = evaParser.parse(`(begin ${program})`);

        /*
            TODO : Convert EVA AST into JS AST 
        */
        const JsAST = this.generateProgram(EvaAST);

        /*
            TODO : Generate JS code from AST 
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
        `const{print} = require('./src/runtime');

${code}`
        fs.writeFileSync(filename, out, 'utf-8');
    }

    /*
        generates JS AST for the entire program
    */
    generateProgram(programBlock){
        const [_tag, ...expressions] = programBlock
        const body = [];
        expressions.forEach(element => {
            body.push(this._toStatement(this.generateJsAST(element)));
        });
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
            const body = [];
            expressions.forEach(element => {
                body.push(this._toStatement(this.generateJsAST(element)));
            });
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
        // (for (var j 5) (< j 10) (j ++) <body>)
        //While loop
        // (<init> while <test> <ToStatement(body)> <update>)
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
    //-----------------------
    // Functions
    //-----------------------

        //Function Call eg : (square 2)
        if(Array.isArray(exp)){
            const fnName = this._toVariableName(exp[0]);
            const callee = this.generateJsAST(fnName);
            const args = exp.slice(1).map(arg => this.generateJsAST(arg))
            return {
                type : 'CallExpression',
                callee : callee,
                arguments : args,
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