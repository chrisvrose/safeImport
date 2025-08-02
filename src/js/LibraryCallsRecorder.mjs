/**
 * Record library calls
 */

export class LibraryCallsRecorder {
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
    pushToMap(moduleName, libraryFunctionSegment, argumentsCalled) {
        const modulePortion = this.#calls.get(moduleName) ?? new Map();

        const defArgs = modulePortion.get(libraryFunctionSegment) ?? [];
        defArgs.push(argumentsCalled);

        modulePortion.set(libraryFunctionSegment, defArgs);
        this.#calls.set(moduleName, modulePortion);
    }

    get calls() {
        return this.#calls;
    }

}
