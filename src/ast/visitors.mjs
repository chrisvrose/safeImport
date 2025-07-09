import { Visitor } from "esrecurse"

export class ExpressionArrayVisitor extends Visitor {
    /**
     * 
     * @param {import('eslint').Scope.ScopeManager} scopeManager 
     */
    constructor(scopeManager) {
        super();
        /**
         * @type {import('estree').Literal["value"][]}
         */
        this.arguments = [];
    }

    /**
     * 
     * @param {import('estree').CallExpression} node 
     * @returns 
     */
    CallExpression(node) {
        for (const argumentNode of node.arguments) {
            this.visit(argumentNode);
        }
    }
    /**
     * 
     * @param {import('estree').Expression} node 
     */
    Expression(node) {
        return this.visit(node.arguments);
    }

    /**
     * 
     * @param {SpreadExpression} node 
     */
    SpreadExpression(node) {
        throw Error("No Spreads!");
    }

    /**
     * 
     * @param {import("estree").Identifier} node 
     */
    Identifier(node) {
        // TODO - Grab it from outside
        console.error("Found identifier ", node);
        throw Error("constant or nothing");
    }
    /**
     * 
     * @param {import("estree").Literal} node 
     */
    Literal(node) {
        this.arguments.push(node.value);
    }
    ObjectExpression(node) {
        console.warning("Not finished");
        throw Error("TBD");
        this.arguments.push(new ObjectSimplifierVisitor().visit(node));
    }

    /**
     * 
     * @param {import("estree").Node} node 
     */
    visit(node) {
        console.log("Visiting", node.type);
        super.visit(node);
    }

}


class ObjectSimplifierVisitor extends Visitor {
    expr = {};
    exprStack = [];
    // /**
    //  * 
    //  * @param {import("estree").ObjectExpression} node 
    //  */
    // ObjectExpression(node){
    // }


    /**
     * 
     * @param {import("estree").Property} node 
     */
    Property(node){
        this.#topOfStack()?.[ node.key.value];
    }


    visit(node) {
        console.log("Objvisit",node);
        return super.visit(node);
    }

    #topOfStack(){
        return this.exprStack[this.exprStack.length-1];
    }
}