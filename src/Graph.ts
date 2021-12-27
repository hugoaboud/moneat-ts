import { ConnectionGene, Genome, NodeGene } from "./Genome";

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
        
        for (let i = 0; i < this.conns.length; i++) {
            let conn = this.conns[i];
            if (!conn.enabled) continue;
            if (this.seen.includes(conn.out_node.id)) continue;
            
            if (this.last.indexOf(conn.in_node) >= 0) {
                if (!next[conn.out_node.id])
                    next[conn.out_node.id] = {gene: conn.out_node, inputs:[]};    
            }
            
            if (next[conn.out_node.id])
                next[conn.out_node.id].inputs.push(conn)
        }
        
        let nodes = Object.values(next);
        this.last = nodes.map(n => n.gene);
        return nodes;
    }

}