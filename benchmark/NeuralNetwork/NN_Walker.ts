import { ConnectionGene, Genome, NodeGene } from "../../src/Genome";
import { Graph, GraphNode, NeuralNetwork } from "../../src/NeuralNetwork";
import Log, { LogLevel } from "../../src/util/Log";


interface NN_Walker_Node extends NodeGene {
    value: number
}
interface NN_Walker_Connection extends ConnectionGene {
    in_node: NN_Walker_Node
    out_node: NN_Walker_Node
}
interface NN_Walker_GraphNode extends GraphNode {
    gene: NN_Walker_Node
    conns: NN_Walker_Connection[]
}

/**
 * NeuralNetwork: Walker
 * This is the straight-forward implementation. It walks the Genome Graph
 * for each input point.
 */
export class NN_Walker extends NeuralNetwork {

    constructor(genome: Genome) {
        super(new Graph(genome));
    }

    protected Calc(input: number[]): number[] {
        
        this.graph.Reset();

        // Input
        let inputs = this.graph.Walk() as NN_Walker_GraphNode[];
        for (let n = 0; n < inputs.length; n++) {
            inputs[n].gene.value = input[n];
        }
        if (Log.Level === LogLevel.DEBUG) {
            Log.Data(this,'input',input, LogLevel.DEBUG);
            Log.Data(this,'inputs',inputs.map(i => ({node: i.gene.id, value: i.gene.value, conns: i.conns.map(ii => ii.in_node.id)})), LogLevel.DEBUG);
        }

        // Hidden+Output
        let step = []
        while (true) {
            step = this.graph.Walk() as NN_Walker_GraphNode[];

            for (let n = 0; n < step.length; n++) {
                let node = step[n].gene;
                let conns = step[n].conns;
                let sum = 0;
                for (let i = 0; i < conns.length; i++) {
                    sum += (conns[i].in_node.value || 0) * conns[i].weight.value;
                }
                node.value = node.activation(node.bias.value + node.mult.value * sum);
            }          

            if (!step.length) break;

            if (Log.Level === LogLevel.DEBUG)
                Log.Data(this,'step',step.map(i => ({node: i.gene.id, value: i.gene.value, conns: i.conns.map(ii => ii.in_node.id)})), LogLevel.DEBUG);
        }

        // Log output on DEBUG level
        let output = this.graph.genome.getOutputs().map(node => (node as NN_Walker_Node).value)
        if (Log.Level === LogLevel.DEBUG)
            Log.Method(this, 'Calc', `(in:(${input})) => out:(${output})`, LogLevel.DEBUG);

        return output;
    }

}