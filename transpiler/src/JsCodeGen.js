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
            throw `Unexpected expression type ${exp.type}`
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


    //FUNCTION RELATED THINGS
    /*
        CallExpression
    */
    CallExpression(exp){
        const callee = this.gen(exp.callee)
        const args = exp.arguments.map(arg => this.gen(arg)).join(',');
        return `${callee}(${args})`;
    }

    /*
        Return Statement 
    */
    ReturnStatement(exp){
        return `return${this.gen(exp.argument)}`
    }

    FunctionDeclaration(exp){
        const id = this.gen(exp.id);
        const params = exp.params.map(param => this.gen(param)).join(',');
        const body = this.gen(exp.body)
        const async = exp.async? 'async ' : '';
        const generator = exp.generator?'*':''
        return `\n${async}function${generator} ${id}(${params}) ${body}\n`
    }

    /*
        Yield Expressions
    */
    YieldExpression(exp){
        return 'yield'
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
        Branching Statements
    */
    IfStatement(exp){
        const test = this.gen(exp.test);
        const consequent = this.gen(exp.consequent);
        const alternate = exp.alternate != null ? `else ${this.gen(exp.alternate)}` : '';
        
        return `if (${test}) ${consequent} ${alternate}`
    }

    // While Loop
    WhileStatement(exp){
        const test = this.gen(exp.test);
        const body = this.gen(exp.body);

        return `while(${test})${body}`
    }
    
    // For Loop
    ForStatement(exp){
        const init = this.gen(exp.init);
        const test = this.gen(exp.test);
        const update = this.gen(exp.update);
        const body = this.gen(exp.body);

        return `for(${init} ; ${test} ; ${update}) ${body}`
    }


    /*
        Expression Statement code generation
    */
    ExpressionStatement(exp){
        return `${this.gen(exp.expression)};`;
    }

    /*
        Update Expressions (++ or --)
    */
    UpdateExpression(exp){
        if(exp.prefix){
            return `${exp.operator}${this.gen(exp.argument)}`
        }
        return `${this.gen(exp.argument)}${exp.operator}`
    }

    /*
        Binary Expression Code Generation
    */
    BinaryExpression(exp){
        let op = exp.operator;
        if(op == "==") {
            op = "===";
        }
        if(op == "!="){
            op ="!==";
        }
        
        return `(${this.gen(exp.left)} ${op} ${this.gen(exp.right)})`

    }
    /*
        Logical Expression Code Generation for Binary operators (+ - * / etc.)
    */
    LogicalExpression(exp){
        return `(${this.gen(exp.left)} ${exp.operator} ${this.gen(exp.right)})`
    }

    /*
        Logical Expression but only for Unary Operators (- !)
    */
    UnaryExpression(exp){
        return `(${exp.operator}${this.gen(exp.argument)} )`
    }

    /*
        COMPLEX DATA STRUCTURES
    */
        /* 
            LISTS
        */
        ArrayExpression(exp){
            const elements = exp.elements.map(element => this.gen(element))
            return `[${elements.join(', ')}]`
        }
        MemberExpression(exp){
            if(exp.computed){
                return `${this.gen(exp.object)}[${this.gen(exp.property)}]`
            }
            return `${this.gen(exp.object)}.${this.gen(exp.property)}`
        }

        /*
            RECORDS
        */
        ObjectExpression(exp){
            const properties = exp.properties.map(
                prop => this.gen(prop)
            )
            return `{${properties.join(', ')}}`
        }

        ObjectProperty(exp){
            return `${this.gen(exp.key)} : ${this.gen(exp.value)}`
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

