import { ActivationFunction } from "../Activation"
import { ConnectionGene, NodeGene } from "../Gene"
import { Genome } from "../Genome"
import { GraphNode } from "../Graph"
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

 export class DNeuralNetwork extends NeuralNetwork {

    // [0.value, 1.value, 2.value, ...]
    protected nodes!: number[]
    protected id_to_i!: Record<number,number>
    // [0.activation, 1.activation, ...]
    protected actvs!: ActivationFunction[]
    // [n, 0.id, weight, 1.id, weight, ..., mult, bias, out.id]
    protected steps!: number[][]

    protected inputs: number
    protected outputs: number

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

        this.Build();
    }

    /**
     * Build a Neural Network from a Genome.
     * @param genome 
     * @returns 
     */
    protected Build() {
        this.BuildNodesAndActivations();
        this.graph.Walk();
        this.steps = [];
        while (true) {
            let layer = this.graph.Walk();
            if (!layer.length) return;
            this.BuildStepLayer(layer);
        }
    }
    protected BuildNodesAndActivations() {
        let nodes = this.graph.genome.getNodes();
        this.nodes = [];
        this.id_to_i = {};
        this.actvs = [];
        Object.values(nodes).map(node => {
            this.id_to_i[node.id] = this.nodes.length;
            this.nodes.push(0);
            this.actvs.push(node.actv);
        })
    }
    protected BuildStepLayer(layer: GraphNode[]) {
        for (let n = 0; n < layer.length; n++) {
            let node = layer[n].gene;
            let inputs = layer[n].inputs;
            
            let step = this.BuildStep(node, inputs);
            this.steps.push(step);
        }
    }
    protected BuildStep(node: NodeGene, inputs: ConnectionGene[]) {
        let step = [inputs.length];
        for (let i = 0; i < inputs.length; i++) {
            step.push(this.id_to_i[inputs[i].in_node.id]);
            step.push(inputs[i].weight.value);
        }
        step.push(node.mult.value);
        step.push(node.bias.value);
        step.push(this.id_to_i[node.id]);

        if (Log.Level === LogLevel.DEBUG)
            Log.Data(this,'step',step, LogLevel.DEBUG);
            
        return step;
    }

    /**
     * Calculate Neural Network output for given input.
     * This alters the model inner state.
     * @param input 
     * @returns 
     */
    protected Calc(input: number[]): number[] {

        // Input
        for (let i = 0; i < this.inputs; i++)
            this.nodes[i] = input[i];

        // Steps
        for (let i = 0; i < this.steps.length; i++) {
            let step = this.steps[i];
            let val = 0;
            let j = 1;
            
            for (; j < step[0]*2; j+=2) {
                val += this.nodes[step[j]] * step[j+1];
            }
            this.nodes[step[j+2]] = this.actvs[step[j+2]](val * step[j] + step[j+1]);
        }

        return this.nodes.slice(this.inputs, this.inputs+this.outputs);
    }

}