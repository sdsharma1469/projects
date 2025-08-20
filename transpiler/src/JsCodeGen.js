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
        Literals
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

    /*
        CallExpression
    */
    CallExpression(exp){
        const callee = this.gen(exp.callee)
        const args = exp.arguments.map(arg => this.gen(arg)).join(',');
        return `${callee}(${args})`;
    }
    /*
        Block Statement 
    */
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
    /*
        Expression Statement code generation
    */
    ExpressionStatement(exp){
        return `${this.gen(exp.expression)};`;
    }

    /*
        Binary Expression Code Generation
    */
    BinaryExpression(exp){
        const op = exp.operator;
        if(op == "==") {
            return "===";
        }
        if(op == "!="){
            return "!==";
        }
        
        return `(${this.gen(exp.left)} ${op} ${this.gen(exp.right)})`

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

