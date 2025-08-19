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
        // ---------------------
        // Numbers and Strings
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
        // --------------------
        // Variables

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
                name: exp,
            };
        }
        // --------------------
        // Blocks
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
        
        // ----------------------
        // something wrong
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
    _toStatement(exp){
        switch(exp.type){
            case 'StringLiteral':
            case 'NumericLiteral':
            case 'AssignmentExpression':
            case 'VariableDeclaration':
                return {type : 'ExpressionStatement', expression: exp}
            default :
                return exp;
        }
    }
    _isVariableName(exp){
        return typeof(exp) === 'string' && /^[+\-*/<>=a-zA-Z0-9_\.!]+$/.test(exp);
    }
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