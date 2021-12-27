import { ConnectionGene } from "./Gene";

/**
 * Global Innovation Number
 * Used to track innovations through evolution,
 * which allows for efficient crossover of genomes.
 */
 export class Innovation {
    private static last = 0;
    private static cache:Record<string,number> = {}
    static Last() { return this.last; }
    static New(in_id?: number, out_id?: number) {
        if (in_id == undefined || out_id == undefined) return ++this.last;
        let hash = in_id+'#'+out_id;
        if (!this.cache[hash]) this.cache[hash] = ++this.last;
        return this.cache[hash];
    }
    static ResetCache() {
        this.cache = {};
    }
    static Ranges(a: ConnectionGene[], b: ConnectionGene[]): {a:[number,number], b:[number,number]}{
        let a_range = [Infinity,-Infinity] as [number,number];
        for (let i = 0; i < a.length; i++) {
            let inn = a[i].innovation;
            if (inn < a_range[0]) a_range[0] = inn;
            if (inn > a_range[1]) a_range[1] = inn;
        }
        let b_range = [Infinity,-Infinity] as [number,number];
        for (let i = 0; i < b.length; i++) {
            let inn = b[i].innovation;
            if (inn < b_range[0]) b_range[0] = inn;
            if (inn > b_range[1]) b_range[1] = inn;
        }
        return {
            a: a_range,
            b: b_range
        }
    }
}