import * as fs from 'fs';
import { Genome } from "../Genome"
import { Graph } from '../Graph';

/**
 * 
 * @param genome 
 * @returns 
 */
export function DNeuralNetworkCompiler(genome: Genome): string {

    let graph = new Graph(genome);
    let id = genome.getID();
    let inputs = genome.getInputCount();
    let outputs = genome.getOutputCount();
    let nodes = genome.getNodes();

    let file = '';

    // Activations
    let acts = {} as Record<string, string>;
    let id_to_i = {} as Record<number, number>;
    Object.values(nodes).map((node,i) => {
        let act = node.activation;
        if (!acts[act.name]) {
            acts[act.name] = act.toString().replace(/ {4}|\t/g,'').replace(/\n/g,' ');
        }
        id_to_i[node.id] = i;
    })
    file += `const a = [${Object.values(acts).join(',\n')}]\n`;
    file += `const n = Array(${Object.values(nodes).length}).fill(0);\n`

    // Run
    let cmds = []
    graph.Walk();
    while (true) {
        let layer = graph.Walk();
        for (let n = 0; n < layer.length; n++) {
            let cmd = [];
            let node = layer[n].gene;
            let conns = layer[n].inputs;
            
            cmd.push(conns.length);
            for (let i = 0; i < conns.length; i++) {
                cmd.push(id_to_i[conns[i].in_node.id]);
                cmd.push(conns[i].weight.value);
            }
            cmd.push(node.mult.value);
            cmd.push(node.bias.value);
            cmd.push(Object.keys(acts).indexOf(node.activation.name));
            cmd.push(id_to_i[node.id]);
            cmds.push(cmd);
        }
        if (!layer.length) break;
    }
    file += `const s = ${JSON.stringify(cmds)}\n`
    
    file += `function Run(input) {
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
    }`.replace(/INPUTS/g,inputs.toString()).replace('OUTPUTS',outputs.toString()) + '\n';

    file += `module.exports = Run\n`

    fs.writeFileSync('compiled/'+id+'.js', file);
    
    return 'compiled/'+id;

}