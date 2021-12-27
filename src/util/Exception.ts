export class Exception extends Error {

    constructor(
        public msg: string, 
        public code: string
    ) {
        super(`${code}: ${msg}`);
    }

}