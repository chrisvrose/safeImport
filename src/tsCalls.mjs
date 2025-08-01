// @ts-check
import path from 'path';
import tsm, { Identifier, ImportSpecifier, StringLiteral, SyntaxKind, ts, } from 'ts-morph';
import { LibraryTypesRecorder } from './libcalls.mjs';

/**
 * 
 * @param {tsm.StringLiteral[]} importDecls
 * @param {tsm.TypeChecker} checker
 * @param {string} mainFilePath Main file path for the script being analyzed
 * @returns {LibraryTypesRecorder} instance of recorded library calls
 */
export function getImportCallsAndArgumentTypes(importDecls, checker, mainFilePath) {
    const libraryCallsRecorder = new LibraryTypesRecorder();
    for (const importStringDecl of importDecls) {
        // console.log(importStringDecl);
        const importDecl = importStringDecl.getFirstAncestor();
        if (importDecl === undefined) {
            console.error("Import declaration is undefined for", importStringDecl.getText());
            continue;
        }
        if (importDecl.isKind(SyntaxKind.CallExpression)) {
            // the declaration is callExpression. Verify its based an identifier aliasing import or require
            const importExpr = importDecl.getExpression();
            const type = checker.getTypeAtLocation(importExpr);
            console.log("Type of import expression", checker.getTypeText(type));
            // console.log(importExpr);
            if (importExpr.isKind(SyntaxKind.Identifier)) {
                // import is a require or import
                const importName = importExpr.getText();
                const importId = importExpr;

                // check if the require is from node
                if (importName === 'require') {
                    const importSymbol = importId.getType().getSymbol();
                    if (importSymbol === undefined) {
                        console.error("Import identifier has no symbol", importId.getText());
                    } else {
                        const importSymbolFullyQualifiedName = checker.getFullyQualifiedName(importSymbol);
                        if (importSymbolFullyQualifiedName !== 'global.NodeJS.Require') {
                            console.warn("Found require call but not from NodeJS global require");
                        }
                    }


                    console.log("Found require/import call", importExpr);
                    // extract the variables imported from the callexpression
                    const importArgs = importDecl.getArguments();

                    const parent = importDecl.getParent();
                    if (parent?.isKind(SyntaxKind.VariableDeclaration)) {
                        // this is a variable declaration
                        const varDecl = parent;
                        const varName = varDecl.getName();
                        console.log("Variable name", varName);
                        // check if declaration is identifier or object pattern
                    }
                    throw Error("Not implemented yet");
                }
            }


        } else if (importDecl.isKind(SyntaxKind.ImportDeclaration)) {// import {x,z} from 'module'; 
            console.log("Found import declaration", importDecl.getPos());
            console.log("Named imports", importDecl.getNamedImports().length);
            const namedImports = importDecl.getNamedImports();

            for (const namedImport of namedImports) {
                // TODO handle aliases
                handleImportForGivenImport(importStringDecl,namedImport, mainFilePath, libraryCallsRecorder);

            }
            const defaultImportIdentifier = importDecl.getDefaultImport();
            // console.log("Default import",defaultImportIdentifier);
            if( defaultImportIdentifier !== undefined) {
                recordImportedIdentifierUsage(defaultImportIdentifier, mainFilePath, libraryCallsRecorder, importStringDecl, true);
            }

            const namespaceImportIdentifier = importDecl.getNamespaceImport();
            // console.log("Namespace import",namespaceImportIdentifier);
            if( namespaceImportIdentifier !== undefined) {
                recordNamespaceImportIdentifierUsage(namespaceImportIdentifier, mainFilePath, libraryCallsRecorder, importStringDecl);
            }
            
            // recordImportedIdentifierUsage(defaultImportIdentifier, mainFilePath, libraryCallsRecorder, importStringDecl, true);

            console.log("STOP");

        } else {
            console.error("Unexpected import specifier", SyntaxKind[importDecl.getKind()]);
        }
        const importThing = importStringDecl.getParent()

    }
    // throw Error("Not implemented yet");
    return libraryCallsRecorder;
}

/**
 * 
 * @param {tsm.StringLiteral} importStringLiteral
 * @param {ImportSpecifier} namedImport 
 * @param {string} mainFilePath 
 * @param {LibraryTypesRecorder} libraryCallsRecorder
 */
function handleImportForGivenImport(importStringLiteral,namedImport, mainFilePath, libraryCallsRecorder) {
    const aliasNode = namedImport.getAliasNode();
    if (aliasNode !== undefined) {
        console.error("Unhandled named import alias", aliasNode.getText());

    }
    console.log("Named import", namedImport.getNameNode().getText());
    const importNode = namedImport.getNameNode();
    if (importNode.isKind(SyntaxKind.StringLiteral)) {
        throw Error("Unexpected string literal import node. Expected identifier");
    }

    recordImportedIdentifierUsage(importNode, mainFilePath, libraryCallsRecorder, importStringLiteral);
}
/**
 * 
 * @param {Identifier} importNode 
 * @param {string} mainFilePath 
 * @param {LibraryTypesRecorder} libraryCallsRecorder 
 * @param {StringLiteral} importStringLiteral 
 */
function recordNamespaceImportIdentifierUsage(importNode, mainFilePath, libraryCallsRecorder, importStringLiteral) {
    const importRefs = importNode.findReferences();
    for (const importRef of importRefs) {
        const referenceSourceFile = importRef.getDefinition().getSourceFile();
        const comparePath = path.relative(mainFilePath, referenceSourceFile.getFilePath());
        if (comparePath !== '') {
            console.warn("Skipping import reference from other file", referenceSourceFile.getFilePath());
            continue;
        }
        console.log("Compare path", comparePath === '');
        // const filePath = referenceSourceFile.getFilePath();
        // console.log("Refset for import",filePath);
        for (const ref of importRef.getReferences()) {
            if (ref.isDefinition()) {
                continue;
            }
            // console.log("I am ",ref.isDefinition());
            const callExpression = ref.getNode().getFirstAncestorByKind(SyntaxKind.CallExpression);
            

            /**
             * @type {`.${string}`} 
             */
            let getImportSection;

            if(callExpression?.getExpression().getDescendantsOfKind(SyntaxKind.Identifier).some(id=>id===ref.getNode())){
                // asserted that the call expression is using the importNode
                if(callExpression.getExpression().isKind(SyntaxKind.PropertyAccessExpression)){
                    console.log("Used a submethod of import", ref.getNode().getText(),callExpression.getExpression().getText());
                    ref.getNode().getText();
                    const expressionImportSection = callExpression.getExpression().getText().split('.');
                    expressionImportSection.shift();
                    getImportSection = '.'+expressionImportSection.join('.');
                }else{
                    console.warn("Call expression is not using the import node as property access", ref.getNode().getText());
                    continue;
                }
            }else{
                console.warn("Call expression is not using the import node", callExpression?.getText());
                continue;
            }
            const callExpressionArguments = callExpression?.getArguments();
            if (callExpressionArguments === undefined || callExpressionArguments.length === 0) {
                console.warn("No call expressions found for import reference", ref.getNode().getText());
                continue;
            }

            // for(const argument of callExpressionArguments){
            //     console.log(`Arg ${idx} is ${arg.getText()}, type is ${arg.getType()}`);
            // }
            // console.log("Noted call for namespace import", importStringLiteral.getLiteralValue(), getImportSection, callExpressionArguments.map(arg => arg.getType().getText()));
            libraryCallsRecorder.pushToMap(importStringLiteral.getLiteralValue(), getImportSection, callExpressionArguments.map(arg => arg.getType()));

        }
    }
}
/**
 * 
 * @param {Identifier} importNode 
 * @param {string} mainFilePath 
 * @param {LibraryTypesRecorder} libraryCallsRecorder 
 * @param {StringLiteral} importStringLiteral 
 * @param {boolean} [isDefaultImport=false]
 */
function recordImportedIdentifierUsage(importNode, mainFilePath, libraryCallsRecorder, importStringLiteral, isDefaultImport = false) {
    const importRefs = importNode.findReferences();
    for (const importRef of importRefs) {
        const referenceSourceFile = importRef.getDefinition().getSourceFile();
        const comparePath = path.relative(mainFilePath, referenceSourceFile.getFilePath());
        if (comparePath !== '') {
            console.warn("Skipping import reference from other file", referenceSourceFile.getFilePath());
            continue;
        }
        console.log("Compare path", comparePath === '');
        // const filePath = referenceSourceFile.getFilePath();
        // console.log("Refset for import",filePath);
        for (const ref of importRef.getReferences()) {
            if (ref.isDefinition()) {
                continue;
            }
            // console.log("I am ",ref.isDefinition());
            const callExpression = ref.getNode().getFirstAncestorByKind(SyntaxKind.CallExpression);

            const callExpressionArguments = callExpression?.getArguments();
            if (callExpressionArguments === undefined || callExpressionArguments.length === 0) {
                console.warn("No call expressions found for import reference", ref.getNode().getText());
                continue;
            }

            // for(const argument of callExpressionArguments){
            //     console.log(`Arg ${idx} is ${arg.getText()}, type is ${arg.getType()}`);
            // }
            const getImportSection = '.' + (isDefaultImport? 'default':importNode.getText());
            libraryCallsRecorder.pushToMap(importStringLiteral.getLiteralValue(), getImportSection, callExpressionArguments.map(arg => arg.getType()));

        }
    }
}

