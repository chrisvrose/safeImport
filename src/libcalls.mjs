
//@ts-check
/**
* @typedef {import('estree').Literal["value"]} GenericLiteralType
*/

import tsm, { Type } from 'ts-morph';

/**
 * Record library calls
 */
export class LibraryCallsRecorder{
    /**
     * @type {Map<string,Map<string,GenericLiteralType[][]>>}
     */
    #calls = new Map();
    /**
     * 
     * @param {string} moduleName 
     * @param {string} libraryFunctionSegment 
     * @param {any[]} argumentsCalled 
     */
    pushToMap(moduleName, libraryFunctionSegment, argumentsCalled){
        const modulePortion = this.#calls.get(moduleName)?? new Map();
        
        const defArgs = modulePortion.get(libraryFunctionSegment) ?? [];
        defArgs.push(argumentsCalled);

        modulePortion.set(libraryFunctionSegment,defArgs);
        this.#calls.set(moduleName, modulePortion);
    }

    get calls(){
        return this.#calls;
    }
    
}

export class LibraryTypesRecorder{
    /**
     * @type {Map<string,Map<string,Type[][]>>}
     */
    #calls = new Map();
    /**
     * @param {tsm.TypeChecker} checker
     */
    checker;
    /**
     * 
     * @param {string} moduleName 
     * @param {string} libraryFunctionSegment 
     * @param {Type[]} argumentsCalled 
     */
    pushToMap(moduleName, libraryFunctionSegment, argumentsCalled){
        const modulePortion = this.#calls.get(moduleName)?? new Map();
        
        const defArgs = modulePortion.get(libraryFunctionSegment) ?? [];
        defArgs.push(argumentsCalled);

        modulePortion.set(libraryFunctionSegment,defArgs);
        this.#calls.set(moduleName, modulePortion);
    }

    get calls(){
        return this.#calls;
    }

    generateAllArgumentsForRecordedCalls(){
        const callMap = new Map();
        for(const [moduleName, modulePortion] of this.#calls){
            /**
             * @type {Map<string,(GenericLiteralType|null|undefined|{})[][]>}
             */
            const moduleCallMap = new Map();// todo refactor
            for(const [libraryFunctionSegment, argsList] of modulePortion){
                const argsForFunction = argsList.map(args=>args.map(arg=>this.instantiateType(arg)));
                moduleCallMap.set(libraryFunctionSegment,argsForFunction);
            }
            callMap.set(moduleName,moduleCallMap);
        }
        return callMap;
    }

    /**
     * If the the arguments types are available in the map, instantiate set of arguments matching the types.
     * @param {string} moduleName 
     * @param {string} libraryFunctionSegment 
     * @returns {(GenericLiteralType|null|undefined|{})[][]|undefined}
     */
    generateArgumentsForCall(moduleName, libraryFunctionSegment){
        const modulePortion = this.#calls.get(moduleName);
        if(modulePortion===undefined){
            return undefined;
        }
        
        const argsTypesForFunctionCalls = modulePortion.get(libraryFunctionSegment);
        if(argsTypesForFunctionCalls===undefined){
            return undefined;
        }
        return argsTypesForFunctionCalls.map(argTypeForSingleCall=>{
            return argTypeForSingleCall.map(type=>{
                return LibraryTypesRecorder.instantiateType(type);
                
            });
        });

    }
    /**
     * 
     * @param {Type} type 
     * @returns 
     */
    instantiateType(type){
        if(type.isStringLiteral()){
            return type.getLiteralValue();
        }else if(type.isNumberLiteral()){
            return Number(type.getText());
        }else if(type.isBooleanLiteral()){
            return type.getText() === 'true';
        }else if(type.isString()){
            return "";
        }else if(type.isNumber()){
            return 0;
        }else if(type.isBoolean()){
            return false;// BAD IDEA
        }else if(type.isArray()){
            return [];
        }else if(type.isObject()){
            // TODO - handle functions
            return {};
        }else{
            console.warn("Unknown type to instantiate",type.getText());
            return undefined;
        }
    }
}