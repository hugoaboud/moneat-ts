//@ts-nocheck
import * as fs from 'fs';
import { Genome } from "../../src/Genome"
import { BaseNeuralNetwork } from "../../src/NeuralNetwork"

const run = (inputs, outputs) => `function Run(input) {
    for (let i = 0; i < INPUTS; i++) n[i] = input[i];
    let sn = s.length;
    for (let i = 0; i < sn; i++) {
        let c = s[i];
        let cn = c[0]*2;
        let v = 0, j = 1;
        for (; j < cn; j+=2) {
            v += n[c[j]] * c[j+1];
        }
        n[c[j+3]] = a[c[j+2]](v*c[j] + c[j+1]);
    }
    let o = [];
    for (let j = 0; j < OUTPUTS; j++) o[j] = n[INPUTS+j];
    return o;
}`.replace(/INPUTS/g,inputs).replace('OUTPUTS',outputs);

/**
 * NeuralNetwork: StepList
 * This implementation walks the graph once during the build, saving
 * each step as a list of numbers. Then, it runs each step 
 */
 export class NN_CacheMethodFile extends BaseNeuralNetwork {

    protected nn: (input: number[]) => number[]

    constructor(genome: Genome) {
        super(genome);

        let id = genome.getID();
        let inputs = genome.getInputCount();
        let outputs = genome.getOutputCount();
        let nodes = genome.getNodes();

        let file = '';

        //file += `class ${id} {\n`;
        //file += `\tconstructor() {\n`;

        // Activations
        let acts = {} as Record<string, string>;
        for (let i = inputs; i < nodes.length; i++) {
            let act = nodes[i].activation;
            if (!acts[act.name]) {
                acts[act.name] = act.toString().replace(/ {4}|\t/g,'').replace(/\n/g,' ');
            }
        }
        file += `const a = [${Object.values(acts).join(',\n')}]\n`;
        file += `const n = Array(${nodes.length}).fill(0);\n`

        // Run
        let cmds = []
        this.graph.Walk();
        while (true) {
            let layer = this.graph.Walk();
            for (let n = 0; n < layer.length; n++) {
                let cmd = [];
                let node = layer[n].gene;
                let conns = layer[n].conns;
                
                cmd.push(conns.length);
                for (let i = 0; i < conns.length; i++) {
                    cmd.push(conns[i].in_node.id);
                    cmd.push(conns[i].weight.value);
                }
                cmd.push(node.mult.value);
                cmd.push(node.bias.value);
                cmd.push(Object.keys(acts).indexOf(node.activation.name));
                cmd.push(node.id);
                cmds.push(cmd);
            }
            if (!layer.length) break;
        }
        file += `const s = ${JSON.stringify(cmds)}\n`
        console.log(cmds.length);
        console.log(cmds.map(c => c.length).reduce((a,x) => a+x,0)/cmds.length);

        //file += '\t}\n'

        file += run(inputs, outputs) + '\n';
        //file += '}\n'

        //file += `module.exports = ${id}\n`
        file += `module.exports = Run\n`

        fs.writeFileSync('out/'+id+'.js', file);
        
        //id = 'jtXzknUP';
        delete require.cache[require.resolve(__dirname+'/../../../out/'+id+'.js')];
        //const nn_class = require(__dirname+'/../../../out/'+id);
        //this.nn = new nn_class();
        this.nn = require(__dirname+'/../../../out/'+id);
    }

    protected Calc(input: number[]): number[] {
        return this.nn(input);
    }

}