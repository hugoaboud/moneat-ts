import { ActivationFunction } from "../Activation"
import { Genome } from "../Genome"
import { BaseNeuralNetwork } from "../NeuralNetwork"
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

 export class NeuralNetwork extends BaseNeuralNetwork {

    // [0.value, 1.value, 2.value, ...]
    protected nodes: number[]
    // [0.activation, 1.activation, ...]
    protected actvs: ActivationFunction[]
    // [n, 0.id, weight, 1.id, weight, ..., mult, bias, out.id]
    protected steps: number[][]

    protected inputs: number
    protected outputs: number

    /**
     * Build a Neural Network from a Genome.
     * @param genome 
     * @returns 
     */
    constructor(genome: Genome) {
        super(genome);

        this.inputs = genome.getInputCount();
        this.outputs = genome.getOutputCount();

        // Map nodes and activations
        let nodes = genome.getNodes();
        this.nodes = Array(nodes.length).fill(0);

        this.actvs = [];
        for (let i = 0; i < nodes.length; i++) {
            this.actvs.push(nodes[i].activation);
        }
        
        // Inputs   
        this.graph.Walk();
        
        // Layers to Steps
        this.steps = [];
        while (true) {
            let layer = this.graph.Walk();

            for (let n = 0; n < layer.length; n++) {
                let node = layer[n].gene;
                let conns = layer[n].conns;
                
                let step = [conns.length];
                for (let i = 0; i < conns.length; i++) {
                    step.push(conns[i].in_node.id);
                    step.push(conns[i].weight.value);
                }
                step.push(node.mult.value);
                step.push(node.bias.value);
                step.push(node.id);

                if (Log.Level === LogLevel.DEBUG)
                    Log.Data(this,'step',step, LogLevel.DEBUG);
                
                this.steps.push(step);
            }
            
            if (!layer.length) return;
        }

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