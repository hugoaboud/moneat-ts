import * as fs from 'fs';
import { Genome } from "../../src/Genome"
import { NeuralNetwork } from "../../src/NeuralNetwork"

/**
 * NeuralNetwork: StepList
 * This implementation walks the graph once during the build, saving
 * each step as a list of numbers. Then, it runs each step 
 */
 export class NN_MethodFile extends NeuralNetwork {

    protected nn: {
        Run: (input: number[]) => number[]
    }

    constructor(genome: Genome) {
        super(genome);

        let id = genome.getID();
        let inputs = genome.getInputCount();
        let outputs = genome.getOutputCount();
        let nodes = genome.getNodes();

        let file = '';

        for(let i = inputs; i < nodes.length; i++) {
            file += `n${i} = 0` + ((i < nodes.length-1)?', ':'\n')
        }

        //file += `class ${id} {\n`

        // Constructor
        //file += `\tconstructor() {\n\t\t`
        //file += '\t}\n';

        // Activations
        let acts = {} as Record<string, boolean>;
        for (let i = inputs; i < nodes.length; i++) {
            let act = nodes[i].activation;
            if (!acts[act.name]) {
                file += `function ${act.toString().replace('function',act.name).replace(/ {4}|\t/g,'').replace(/\n/g,' ')}\n`
                acts[act.name] = true;
            }
        }

        // Run
        file += `function Run (input) {\n`;
        this.graph.Walk();
        while (true) {
            let layer = this.graph.Walk();

            for (let n = 0; n < layer.length; n++) {
                let node = layer[n].gene;
                let conns = layer[n].inputs;
                
                file += `\tn${node.id} = ${node.activation.name}((`;
                for (let i = 0; i < conns.length; i++) {
                    file += ` ${(conns[i].in_node.id < inputs)?`input[${conns[i].in_node.id}]`:`n${conns[i].in_node.id}`} * ${conns[i].weight.value}` + ((i < conns.length-1)?' + ':'');
                }
                file += ` ) * ${node.mult.value} + ${node.bias.value})\n`
            }
            
            if (!layer.length) break;
        }

        file += '\treturn [';
        for(let i = inputs; i < inputs+outputs; i++) {
            file += `n${i}` + ((i < inputs+outputs-1)?', ':'')
        }
        file += ']\n'
        file += '}\n'
        //file += `\treturn ${id};\n`
        // file += '}\n'
        file += `module.exports = Run;`

        fs.writeFileSync('out/'+genome.getID()+'.js', file);

        //let nn_class = require(__dirname+'/../../../out/AbOVcVgU');
        let nn_class = require(__dirname+'/../../../out/'+genome.getID());
        this.nn = nn_class;
    }

    Reset() {}

    protected Calc(input: number[]): number[] {
        return (this.nn as any)(input);
    }

}