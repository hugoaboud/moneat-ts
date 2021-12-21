import { Header } from "./src/cli/string";
import { Genome } from "./src/Genome";
import { Genome as GenomeConfig } from "./test/config";


console.log(Header("Command Line Interface"));


let genome = new Genome(GenomeConfig(), 1, 1);

let nodes = genome.nodeGenes;
genome.MutateAddConnection(nodes[0],nodes[1]);
let connections = genome.connectionGenes;
genome.MutateAddNode(connections[0]);

genome.Print();

console.log();