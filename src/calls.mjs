import { Syntax } from 'esprima';
import esquery from 'esquery';
import { getSetOfIdentifierReferencesForRequireUses } from './ast/analysis.mjs';
import { LibraryCallsRecorder } from './libcalls.mjs';
import { tagASTNode, getTagKey, untagASTNode } from './ast/tag.mjs';
import { ExpressionArrayVisitor } from './ast/visitors.mjs';
import assert from 'assert';
/**
 *
 * @param {import('eslint').Scope.ScopeManager} scopeManager
 * @returns
 */
export function getRequireCallsAndConstantArgs(scopeManager) {
    const requireReferencesIdentifierSet = getSetOfIdentifierReferencesForRequireUses(scopeManager);
    const callRecorder = new LibraryCallsRecorder();
    // all the variables, what part of require module they're using
    for (const scope of scopeManager.scopes) {
        for (const [variableName, variable] of scope.set) {
            // FIXME raise error if more than one but has import
            const declareDefinesOfVariable = variable.defs.filter(e => e.node.type === Syntax.VariableDeclarator && e.node.init.type === Syntax.CallExpression);
            // uses this variable
            const declarationNodesUsingRequireList = declareDefinesOfVariable.filter(e => requireReferencesIdentifierSet.has(e.node.init.callee));
            if (declarationNodesUsingRequireList.length > 1) {
                console.error(`Import variable ${variableName} has been defined twice, skipping`);
                continue;
            } else if (declarationNodesUsingRequireList.length === 0) {
                console.log(`Skipping unused import variable ${variableName}`);
                continue;
            }
            const declarationNodeUsingRequire = declarationNodesUsingRequireList[0]; // we know its singleton from above



            // 
            const moduleImportedName = getModuleNameFromRequireAssignDeclaration(declarationNodeUsingRequire);
            const importPortion = getModuleImportPortionFromDefinition(declarationNodeUsingRequire, variableName);
            for (const importVariableReference of variable.references) {
                tagASTNode(importVariableReference, variableName, moduleImportedName);

                const simpleCallExpressionsOfVariableInBlockList = esquery.query(importVariableReference.from.block, `CallExpression:has(>[tag="${importVariableReference.identifier[getTagKey()]}"])`);
                for (const simpleCallExpressionOfVariableInBlock of simpleCallExpressionsOfVariableInBlockList) {
                    const argumentsGathered = gatherArgumentsFromTheCallExpression(importVariableReference, simpleCallExpressionOfVariableInBlock, importVariableReference.from.block, scopeManager);
                    callRecorder.pushToMap(moduleImportedName, importPortion, argumentsGathered);
                    
                }
                untagASTNode(importVariableReference, variableName, moduleImportedName)
            }
        }
    }
    return callRecorder.calls;
}/**
 *
 * @param {import('eslint').Scope.Definition} declaratorDefinition
 */

export function getModuleImportPortionFromDefinition(declaratorDefinition, variableName) {
    const node = declaratorDefinition.node;
    // console.log(`Req type`, node.type);
    // FIXME - import portion calculations correctly
    if (node.id.type === 'ObjectPattern') {
        // console.log("Obj");
        // const nodeName = node.id.properties.filter(e=>e.key.value.name==='x')
        // TODO allow re-naming
        return "." + variableName;
    } else {
        return '.';
    }
}
/**
 *
 * @param {import('eslint').Scope.Reference} importVariableReference
 * @param {import('estree').CallExpression} callExpressionNode
 * @param {ReturnType<esquery>[0]} contextOfUse
 * @param {import('eslint').Scope.ScopeManager} scopeManager
 */

export function gatherArgumentsFromTheCallExpression(importVariableReference, callExpressionNode, contextOfUse, scopeManager) {
    const expressionArrayVisitor = new ExpressionArrayVisitor(scopeManager);
    expressionArrayVisitor.visit(callExpressionNode);
    const { arguments: constantArguments } = expressionArrayVisitor;
    return constantArguments;
}
/**
 *
 * @param {Scope.Definition} requireUsingReference
 * @returns {string}
 */
export function getModuleNameFromRequireAssignDeclaration(requireUsingReference) {
    assert(requireUsingReference.node.init.arguments.length === 1);
    const moduleImported = requireUsingReference.node.init?.arguments?.[0]?.value ?? null;
    assert(moduleImported !== null, "Module has to exist");

    return moduleImported;
}

