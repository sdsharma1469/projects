/*
    JS Transformations
*/

class jsTransform{
    static functionToAsyncGenerator(fnNode){
        const genFn = {
            type : 'FunctionDeclaration',
            id : {
                type : 'Identifier',
                name : `_${fnNode.id.name}`
            },
            generator : true,
            async : true,
            params : fnNode.params
        }
        
        const genBlockBlody = [...fnNode.body.body]

        for(let i = 1; i < genBlockBlody.length ; i+=2){
            genBlockBlody.splice(
                i,
                0,
                {type : 'ExpressionStatement', expression : {type : 'YieldExpression'}}
            )
        }

        genFn.body = {type : 'BlockStatement', body : genBlockBlody}
        return genFn
    }
}

module.exports = {
    jsTransform
}