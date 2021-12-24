import { ConnectionGene, Genome, NodeGene } from "./Genome";
import { Exception } from "./util/Exception";
import { StringID } from "./util/Random";

export interface GraphNode {
    gene: NodeGene
    conns: ConnectionGene[]
}

export class Graph {

    protected nodes: NodeGene[]
    protected conns: ConnectionGene[]

    protected last?: NodeGene[]
    protected seen: number[] = []

    constructor(
        public genome: Genome
    ) {
        this.nodes = this.genome.getNodes();
        this.conns = this.genome.getConns();
    }

    Reset() {
        this.last = undefined;
        this.seen = [];
    }

    Walk(): GraphNode[] {
        
        // Step 0: return inputs
        if (!this.last) {
            this.last = this.genome.getInputs();
            return this.last.map(g => ({
                gene: g,
                conns: []
            }));
        }

        // Flag seen nodes
        for (let i = 0; i < this.last.length; i++) {
            this.seen.push(this.last[i].id);
        }

        // Step 1+: walk on the graph
        let next = {} as Record<number,GraphNode>;
        
        for (let i = 0; i < this.conns.length; i++) {
            let conn = this.conns[i];
            if (!conn.enabled) continue;
            if (this.seen.includes(conn.out_node.id)) continue;
            
            if (this.last.indexOf(conn.in_node) >= 0) {
                if (!next[conn.out_node.id])
                    next[conn.out_node.id] = {gene: conn.out_node, conns:[]};    
            }
            
            if (next[conn.out_node.id])
                next[conn.out_node.id].conns.push(conn)
        }
        
        let nodes = Object.values(next);
        this.last = nodes.map(n => n.gene);
        return nodes;
    }

}

export abstract class NeuralNetwork {    

    protected id: string

    protected inputs: number
    protected outputs: number

    constructor(
        protected graph: Graph
    ) {
        this.id = StringID();
        this.inputs = graph.genome.getInputCount();
        this.outputs = graph.genome.getOutputCount();
    }

    Run(input: number[]): number[] {
        if (input.length != this.inputs) throw NetworkException.WrongInputLength(this.inputs, input.length);
        return this.Calc(input);
    }
    protected abstract Calc(input: number[]): number[]
}

/**
 * Network Exceptions
 */

 class NetworkException extends Exception {
    
    static code = 'E_NETWORK'

    static WrongInputLength(expected: number, received: number) {
        return new this(`Wrong input data length. expected: ${expected}, received: ${received}`, this.code);
    }

}