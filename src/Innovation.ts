import { ConnectionGene, NodeGene } from "./Gene";

/**
 * Global Innovation Number
 * Used to track innovations through evolution,
 * which allows for efficient crossover of genomes.
 */
export class NodeInnovation {
    private static last = -1;
    private static cache:Record<string,number> = {}

    static Last() { return this.last; }
    
    static New(in_id: number, out_id: number) {
        let hash = in_id+'#'+out_id;
        if (!(hash in this.cache)) this.cache[hash] = ++this.last;
        return this.cache[hash];
    }
    
    static ResetCache() {
        this.cache = {};
    }
}
export class ConnInnovation {
    private static last = -1;
    private static cache:Record<string,number> = {}

    static Last() { return this.last; }
    
    static New(in_id: number, out_id: number) {
        let hash = in_id+'#'+out_id;
        if (!(hash in this.cache)) this.cache[hash] = ++this.last;
        return this.cache[hash];
    }
    
    static ResetCache() {
        this.cache = {};
    }
}

export function InnovationRanges<T extends NodeGene|ConnectionGene>(a: T[], b: T[]): {a:[number,number], b:[number,number]}{
    let a_range = [Infinity,-Infinity] as [number,number];
    if (a.length == 0) a_range = [-Infinity,Infinity];
    for (let i = 0; i < a.length; i++) {
        let inn = a[i].id;
        if (inn < a_range[0]) a_range[0] = inn;
        if (inn > a_range[1]) a_range[1] = inn;
    }
    let b_range = [Infinity,-Infinity] as [number,number];
    if (b.length == 0) b_range = [-Infinity,Infinity];
    for (let i = 0; i < b.length; i++) {
        let inn = b[i].id;
        if (inn < b_range[0]) b_range[0] = inn;
        if (inn > b_range[1]) b_range[1] = inn;
    }
    return {
        a: a_range,
        b: b_range
    }
}