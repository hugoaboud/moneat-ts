import { ActivationFunction } from "../Activation"
import { ConnectionGene, NodeGene } from "../Gene"
import { Genome } from "../Genome"
import { Graph, GraphNode } from "../Graph"
import { NeuralNetwork } from "../NeuralNetwork"
import Log, { LogLevel } from "../util/Log"

/**
 * 
 * Default NeuralNetwork
 * 
 * This is the library default implementation of a neural network.
 * It supports generic neurons, recursive connections and spiking activation.
 * 
 * An optimized model is built from the genome, which is then
 * used to process input. It usually takes around 30~80us for each run.
 * 
 * It also allows you to compile the neural network into a single .js file, which
 * can be imported and used anywhere.
 * 
 */

type NetworkStep = number[]



 export class DNeuralNetwork extends NeuralNetwork {

    // [0.value, 1.value, 2.value, ...]
    protected nodes: number[] = []
    protected id_to_i: Record<number,number> = {}
    // [0.activation, 1.activation, ...]
    protected actvs: ActivationFunction[] = []
    // [n, 0.id, weight, 1.id, weight, ..., mult, bias, out.id]
    protected steps: number[][] = []

    protected inputs: number
    protected outputs: number

    protected graph: Graph

    /**
     * Resets the node states
     * This is run when the network is created
     */
    Reset() {
        for (let i = 0; i < this.nodes.length; i++)
            this.nodes[i] = 0;
    }

    
    constructor(genome: Genome) {
        super(genome);
        this.inputs = genome.getInputCount();
        this.outputs = genome.getOutputCount();
        this.graph = new Graph(genome);
        this.Build();
    }   

    protected BuildStep(node: GraphNode) {
        let inputs = node.inputs;
        let gene = node.gene;
        let step = [inputs.length];
        for (let i = 0; i < inputs.length; i++) {
            step.push(this.id_to_i[inputs[i].in_node]);
            step.push(inputs[i].weight.value);
        }
        step.push(gene.mult.value);
        step.push(gene.bias.value);
        step.push(this.id_to_i[gene.id]);

        return step;
    }

    /**
     * Build a Neural Network from a Genome.
     * @param genome 
     * @returns 
     */
    protected Build() {
        Log.Genome(this.graph.genome);
        let nodes = this.graph.SortedNodes();

        nodes.map(node => {
            this.id_to_i[node.gene.id] = this.nodes.length;
            this.nodes.push(0);
            this.actvs.push(node.gene.actv);
        })
        nodes.map(node => {
            if (node.gene.type === 'input') return;
            this.steps.push(this.BuildStep(node));
        });
    }

    /**
     * Calculate Neural 
     * Network output for given input.
     * This alters the model inner state.
     * @param input 
     * @returns 
     */
    protected Calc(input: number[]): number[] {

        //console.log(this.graph.genome.getID());
        //console.log('input', input);
        //console.log('nodes before', this.nodes);
        // Input
        for (let i = 0; i < this.inputs; i++)
            this.nodes[i] = input[i];
            
        // Steps
        for (let i = 0; i < this.steps.length; i++) {
            let step = this.steps[i];
            //console.log('step', step);
            let val = 0;
            let j = 1;
            
            for (; j < step[0]*2; j+=2) {
                val += this.nodes[step[j]] * step[j+1];
            }
            this.nodes[step[j+2]] = this.actvs[step[j+2]](val * step[j] + step[j+1]);
            //console.log('node step', this.nodes);
        }
            
        //console.log('nodes after', this.nodes);
        //console.log('output', this.nodes.slice(this.inputs, this.inputs+this.outputs));
        //console.log('---');
        return this.nodes.slice(-this.outputs);
    }

}