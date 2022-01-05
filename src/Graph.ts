import { ConnectionGene, NodeGene } from "./Gene";
import { Genome } from "./Genome";

export interface GraphNode {
    gene: NodeGene
    inputs: ConnectionGene[]
    outputs: NodeGene[]
}
interface SortNode extends GraphNode {
    _inputs: number[]
    _outputs: number[]
}
type SortSubgraph = Record<number,SortNode>

export class Graph {

    inputs: GraphNode[] = []
    nodes: Record<number,GraphNode> = {}

    constructor(
        public genome: Genome
    ) {
        let nodes = genome.getNodes();
        let conns = genome.getConns();
        let roots = genome.getOutputs()
                          .map(gene => ({gene, inputs:[], outputs:[]}))
                          .reduce((a:Record<number,GraphNode>,x) => {a[x.gene.id] = x; return a;}, {});        
        Object.values(roots).map(n => this.nodes[n.gene.id] = n);
        
        this.inputs = genome.getInputs().map(gene => ({gene})) as any as GraphNode[];

        while (true) {
            let layer = [];
            for (let c = 0; c < conns.length; c++) {
                if (!conns[c].enabled.value) continue;
                let in_node = nodes[conns[c].in_node];
                let out_node = roots[conns[c].out_node];
                if (!out_node) continue;
                out_node.inputs.push(conns[c]);
                if (this.nodes[in_node.id]) {
                    this.nodes[in_node.id].outputs.push(out_node.gene);
                    continue;
                }
                layer.push({
                    gene: in_node,
                    inputs: [],
                    outputs: [out_node.gene]
                });
                this.nodes[in_node.id] = layer[layer.length-1];
            }
            if (layer.length == 0) break;
            roots = {}
            layer.map(n => {
                this.nodes[n.gene.id] = n;
                roots[n.gene.id] = n;
            });
        }
    }

    /**
     * Graph Sorting:
     * Sorts nodes from input to output so every non-recurrent node
     * has all of it's dependency nodes set before it.
     * Recurrent nodes are sorted by their id, since there's no
     * inherent order to recurrent operations.
     */

    private Sort_RemoveNode(subgraph: SortSubgraph, node: SortNode) {
        node._inputs.map(i => {
            let input = subgraph[i];
            input._outputs = input._outputs.filter(loop => loop != node.gene.id)
        })
        node._outputs.map(o => {
            let output = subgraph[o];
            output._inputs = output._inputs.filter(loop => loop != node.gene.id)
        })
        delete subgraph[node.gene.id];
    }

    private Sort_Split(subgraph: SortSubgraph, roots: SortNode[]): SortSubgraph[] {

        if (roots.reduce((a,x) => a += x._inputs.length, 0) == 0) return [];

        let layers = [] as SortSubgraph[];
        let seen = roots.map(r=>r.gene.id) as number[];

        while (true) {
            let layer = {} as SortSubgraph;

            roots.map(root => {
                root._inputs.map(i => {
                    if (seen.includes(i)) return;
                    seen.push(i);
                    layer[i] = subgraph[i];
                })
            })

            if (Object.keys(layer).length == 0) break;
            layers.push(layer);
            roots = Object.values(layer);
        }

        return layers.map(layer => {
            let ids = Object.values(layer).map(node => node.gene.id);
            Object.values(layer).map(node => {
                node._inputs = node._inputs.filter(i => ids.includes(i));
                node._outputs = node._outputs.filter(o => ids.includes(o));
            })
            return layer;
        }).reverse();
    }

    private Sort(subgraph: SortSubgraph): GraphNode[] {
        let sorted = [] as GraphNode[];

        let nodes = Object.values(subgraph);
        if (nodes.length == 1) return nodes;
        
        let input_nodes = nodes.filter(node => (node as any)._inputs.length == 0);
        input_nodes.map(n => {
            this.Sort_RemoveNode(subgraph, n);
            sorted.push(n);
        });

        let output_nodes = nodes.filter(node => (node as any)._outputs.length == 0);

        if (output_nodes.length == 0) {
            return sorted.concat(nodes);
        }

        let layers = this.Sort_Split(subgraph, output_nodes);

        layers.map(layer => {
            sorted.push(...this.Sort(layer));
        })
        sorted.push(...output_nodes);

        return sorted;
    }

    SortedNodes() {
        Object.values(this.nodes).map(n => {
            let node = n as SortNode;
            node._inputs = node.inputs.map(i => i.in_node);
            node._outputs = node.outputs.map(o => o.id);
        })
        let sorted = this.Sort(this.nodes as SortSubgraph);
        sorted.map(node => {
            delete (node as any)._inputs;
            delete (node as any)._outputs;
        })

        let outputs = Object.values(this.nodes).filter(n => n.gene.type === 'output');
        let hidden = Object.values(sorted).filter(n => n.gene.type === 'hidden');
        return [...this.inputs, ...hidden, ...outputs];
    }

}