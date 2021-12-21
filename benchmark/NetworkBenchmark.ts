import { Header } from "../src/cli/string";
import { Genome, NodeGene } from "../src/Genome";
import { Network, RawGenomeNetwork } from "../src/Network";
import { TrackTime } from "../src/util/Benchmark";
import Log from "../src/util/Log";
import { Genome as GenomeConfig } from "../test/config";

console.log(Header('Benchmark: Network'));

const INPUTS = 2;
const OUTPUTS = 2;
const MUTATIONS = 2;

const Input = Array.from({length: INPUTS}, () => Math.random());

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
    let genome = new Genome(GenomeConfig(), INPUTS, OUTPUTS);
    for (let i = 0; i < MUTATIONS; i++) {
        MutateAddConnection(genome);
        genome.MutateAddNode(genome.RandomEnabledConnection());
        MutateAddConnection(genome);
    }
    return genome;
}

/* Benchmark */

let genome = NewGenome();

console.log();
Log.Genome(genome);
console.log();

TrackTime('RawGenomeNetwork', () => {

    let network = new RawGenomeNetwork(genome);
    network.Run(Input);

}, 1);