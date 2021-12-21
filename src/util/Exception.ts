export class Exception extends Error {

    constructor(msg: string, code: string) {
        super(`${code}: ${msg}`);
    }

}