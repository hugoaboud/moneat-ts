import { Activation } from "../src/Activation";
import { Header } from "../src/cli/String";
import { Genome } from "../src/Genome";
import { TrackTime } from "../src/util/Benchmark";
import Log, { LogLevel } from "../src/util/Log";
import { Genome as GenomeConfig } from "../test/config";
import { NN_MethodFile } from "./NeuralNetwork/NN_MethodFile";
import { NN_StepList } from "./NeuralNetwork/NN_StepList";
import { NN_CacheMethodFile } from "./NeuralNetwork/NN_CacheMethodFile";
import { NN_Walker } from "./NeuralNetwork/NN_Walker";

console.log(Header('Benchmark: Network'));

const INPUTS = 32;
const OUTPUTS = 32;
const MUTATIONS = 1024;
const STEPS = 1000;

const Input = Array.from({length: 100000}, () => Array.from({length: INPUTS}, () => Math.random()));

/* Genome Build */

function MutateAddConnection(genome: Genome, tries = 3) {
    for (let i = 0; i < tries; i++) {
        try {
            let pair = genome.RandomNodePair()
            genome.AddConnection(pair[0], pair[1]);
            return;
        } catch {}
    }
}
function NewGenome(): Genome {
    let genome = new Genome(GenomeConfig({
        inputs: INPUTS,
        outputs: OUTPUTS,
        activation: {   
            hidden: [Activation.Clamped],
            output: [Activation.Clamped]
        }
    }));
    for (let i = 0; i < MUTATIONS; i++) {
        MutateAddConnection(genome);
        genome.AddNode(genome.RandomEnabledConnection());
        MutateAddConnection(genome);
        //MutateAddConnection(genome);
        //MutateAddConnection(genome);
    }
    return genome;
}

/* Benchmark */

Log.Level = LogLevel.ERROR;

let genome = NewGenome();
console.log(genome.getID());	

// Log.Genome(genome);

let walker = new NN_Walker(genome);
let out_walker = [] as number[];
TrackTime('Walker', (i) => {
    out_walker = walker.Run(Input[i]);
}, STEPS);
console.log(out_walker);

let step_list = new NN_StepList(genome);
let out_step_list = [] as number[];
TrackTime('Step List', (i) => {
    out_step_list = step_list.Run(Input[i]);
}, STEPS);
console.log(out_step_list);

let method_file = new NN_MethodFile(genome);
let out_method_file = [] as number[];

TrackTime('Method File', (i) => {
    out_method_file = method_file.Run(Input[i]);
}, STEPS);
console.log(out_method_file);

let cache_method_file = new NN_CacheMethodFile(genome);
let out_cache_method_file = [] as number[];

TrackTime('Method File With Cache', (i) => {
    out_cache_method_file = cache_method_file.Run(Input[i]);
}, STEPS);
console.log(out_cache_method_file);