class JsCodeGen{
    /*
        Constructor used for pretty printing for now
    */

    constructor({indent = 2}){
        this._indent = indent;
        this._currentIndent = 0;
    }
    /*
        generates code for given program
    */
    generate(exp){
        return this.Program(exp);
    }

    /*
        generates code for js AST node 
    */
    gen(exp){
        if(this[exp.type] == null){
            throw `Unexpected expression type ${ exp.type}`
        }
        return this[exp.type](exp);
    }

    /*
        Functions to determine how to convert each AST type into JavaScript code
    */

    NumericLiteral(exp){
        return `${exp.value}`;
    }
    
    StringLiteral(exp){
        return `"${exp.value}"`
    }

    /*
        Variable Declaration
    */
    VariableDeclaration(exp){
       let {id, init} = exp.declarations[0];
       return `let ${this.gen(id)} = ${this.gen(init)}`;
    }

    /*
        Variable Assignment
    */
    AssignmentExpression(exp){
        return `${this.gen(exp.left)} ${exp.operator} ${this.gen(exp.right)}`
    }
    Identifier(exp){
        return exp.name;
    }

    BlockStatement(exp){
        this._currentIndent += this._indent;
        let result =  
        '{\n' +
            exp.body.map(element => this._ind() + this.gen(element))
            .join('\n') +
        '\n';

        this._currentIndent -= this._indent;
        result += this._ind() + '}';
        return result;
    }

    ExpressionStatement(exp){
        return `${this.gen(exp.expression)};`;
    }

    Program(exp){
        return exp.body.map(expression => this.gen(expression)).join('\n');
    }
    

    /*
        Helper functions
    */
    _ind(){
        return ' '.repeat(this._currentIndent);
    }
}

module.exports = { 
    JsCodeGen
};

