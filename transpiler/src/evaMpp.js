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
        fs.writeFileSync(filename, code, 'utf-8');
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
        if(this._isNumber(exp)){
            return {
                type : 'NumericLiteral',
                value : exp,
            };
        }
        else if (this._isString(exp)){
            return{
                type : 'StringLiteral',
                value : exp.slice(1,-1)
            }
        }
        else if (exp[0] === 'begin'){
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
        else{
            throw `Unexpected Expression ${JSON.stringify(exp)}.`
        }
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
    _toStatement(exp){
        switch(exp.type){
            case 'StringLiteral':
            case 'NumericLiteral':
                return {type : 'ExpressionStatement', expression: exp}
            default :
                return exp;
        }
    }
}

module.exports = {
    evaMPP,
}