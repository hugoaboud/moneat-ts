import { ConnectionGene, NodeGene } from "./Gene";
import { Genome } from "./Genome";

export interface GraphNode {
    gene: NodeGene
    inputs: ConnectionGene[]
}

export class Graph {

    protected conns: ConnectionGene[]

    protected last?: NodeGene[]
    protected seen: number[] = []

    constructor(
        public genome: Genome
    ) {
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
                inputs: []
            }));
        }

        // Flag seen nodes
        for (let i = 0; i < this.last.length; i++) {
            this.seen.push(this.last[i].id);
        }

        // Step 1+: walk on the graph
        let next = {} as Record<number,GraphNode>;
        let nodes = this.genome.getNodes();

        for (let i = 0; i < this.conns.length; i++) {
            let conn = this.conns[i];
            if (!conn.enabled.value) continue;
            if (this.seen.includes(conn.out_node)) continue;
            
            if (this.last.indexOf(nodes[conn.in_node]) >= 0) {
                if (!next[conn.out_node])
                    next[conn.out_node] = {gene: nodes[conn.out_node], inputs:[]};    
            }
            
            if (next[conn.out_node])
                next[conn.out_node].inputs.push(conn)
        }
        
        let layer = Object.values(next);
        this.last = layer.map(n => n.gene);
        return layer;
    }

}