import { ConnectionGene, Genome, NodeGene } from "./Genome";
import { Exception } from "./util/Exception";


interface GenomeGraphNode {
    node: NodeGene
    inputs: NodeGene[]
}
class GenomeGraph {

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

    walk(): GenomeGraphNode[] {
        
        // Step 0: return inputs
        if (!this.last) {
            this.last = this.genome.getInputs();
            return this.last.map(g => ({
                node: g,
                inputs: []
            }));
        }

        // Flag seen nodes
        for (let i = 0; i < this.last.length; i++) {
            this.seen.push(this.last[i].id);
        }

        // Step 1+: walk on the graph
        let next = {} as Record<number,GenomeGraphNode>;
        
        for (let i = 0; i < this.conns.length; i++) {
            let conn = this.conns[i];
            if (!conn.enabled) continue;
            if (this.seen.includes(conn.out_node.id)) continue;
            
            if (this.last.indexOf(conn.in_node) >= 0) {
                if (!next[conn.out_node.id])
                    next[conn.out_node.id] = {node: conn.out_node, inputs:[]};    
            }
            
            if (next[conn.out_node.id])
                next[conn.out_node.id].inputs.push(conn.in_node)
        }
        
        let nodes = Object.values(next);
        this.last = nodes.map(n => n.node);
        return nodes;
    }

}

export abstract class Network {    
    
    protected inputs: number
    protected outputs: number

    constructor(
        protected graph: GenomeGraph
    ) {
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
 * Network Implementations
 * These are preserved here for benchmark reasons.
 */

interface RawGenomeNetworkNode extends NodeGene {
    value: number
}

export class RawGenomeNetwork extends Network {

    constructor(genome: Genome) {
        super(new GenomeGraph(genome));
    }

    protected Calc(input: number[]): number[] {
        
        let inputs = this.graph.walk();
        console.log(inputs.map(i => ({node: i.node.id, inputs: i.inputs.map(ii => ii.id)})));
        
        let layer = []
        while (true) {
            layer = this.graph.walk();
            if (!layer.length) break;

            console.log(layer.map(i => ({node: i.node.id, inputs: i.inputs.map(ii => ii.id)})));
        }

        return [];
    }

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