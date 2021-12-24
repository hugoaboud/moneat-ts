import { Activation } from "./src/Activation";
import { Header } from "./src/cli/string";
import { Genome } from "./src/Genome";
import { NeuralNetwork } from "./src/nn/Default";
import { NeuralNetworkCompiler } from "./src/nn/DefaultCompiler";
import { TrackTime } from "./src/util/Benchmark";
import Log, { LogLevel } from "./src/util/Log";
import { Genome as GenomeConfig } from "./test/config";

console.log(Header("Command Line Interface"));

const INPUTS = 32;
const OUTPUTS = 32;
const MUTATIONS = 1024;
const STEPS = 10000;

const Input = Array.from({length: 100000}, () => Array.from({length: INPUTS}, () => Math.random()));

/* Genome Build */

function MutateAddConnection(genome: Genome, tries = 3) {
    for (let i = 0; i < tries; i++) {
        try {
            let pair = genome.RandomNodePair()
            genome.MutateAddConnection(pair[0], pair[1]);
            return;
        } catch {}
    }
}
function NewGenome(): Genome {
    let genome = new Genome(GenomeConfig({
        activation: {   
            hidden: [Activation.Clamped],
            output: [Activation.Clamped]
        }
    }), INPUTS, OUTPUTS);
    for (let i = 0; i < MUTATIONS; i++) {
        MutateAddConnection(genome);
        genome.MutateAddNode(genome.RandomEnabledConnection());
        MutateAddConnection(genome);
    }
    return genome;
}


Log.Level = LogLevel.ERROR;

let genome = NewGenome();
console.log(genome.getID());
//Log.Genome(genome);	

let defaul = {
    nn: new NeuralNetwork(genome),
    out: [] as number[]
};

let compiled_path = __dirname+'/../'+NeuralNetworkCompiler(genome);
delete require.cache[compiled_path];

let compiled = {
    nn: require(compiled_path),
    out: [] as number[]
};

TrackTime('Default', (i) => {
    defaul.out = defaul.nn.Run(Input[i]);
}, STEPS);
console.log(defaul.out);

TrackTime('Compiled', (i) => {
    compiled.out = compiled.nn(Input[i]);
}, STEPS);
console.log(compiled.out);