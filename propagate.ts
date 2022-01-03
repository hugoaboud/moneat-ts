import { Header } from "./src/cli/String";
import { ConnectionGene, NodeGene } from "./src/Gene";
import { Genome } from "./src/Genome";
import { Graph } from "./src/Graph";
import { DNeuralNetwork } from "./src/neuralnetwork/Default";
import { DefaultGenomeConfig } from "./src/util/Defaults";
import Log from "./src/util/Log";

console.log(Header('Propagation Algorithm Sandbox'))

let config = DefaultGenomeConfig({
    inputs: 2,
    outputs: 1
});
let genome = new Genome(config);

let nodes = genome.getNodes();
let conns = genome.getConns();
// genome.AddConnection(nodes[0], nodes[3]);
// genome.AddNode(conns[0]);
// genome.AddConnection(nodes[2], nodes[4]);
// genome.AddNode(conns[3]);
// genome.AddNode(conns[2]);
// genome.AddNode(conns[5]);
// genome.AddConnection(nodes[1], nodes[5]);
// genome.AddConnection(nodes[1], nodes[6]);
// genome.AddConnection(nodes[6], nodes[5]);
// genome.AddConnection(nodes[7], nodes[8]);
// genome.AddConnection(nodes[7], nodes[4]);

(genome as any).nodes[3] = new NodeGene(config, 3, 'hidden');
(genome as any).nodes[4] = new NodeGene(config, 4, 'hidden');
(genome as any).nodes[8] = new NodeGene(config, 8, 'hidden');
(genome as any).nodes[15] = new NodeGene(config, 15, 'hidden');
(genome as any).nodes[51] = new NodeGene(config, 51, 'hidden');

(genome as any).conns.push(new ConnectionGene(config, 5,   4,  2));
(genome as any).conns.push(new ConnectionGene(config, 1,   1,  2));
(genome as any).conns.push(new ConnectionGene(config, 14,  3,  8));
(genome as any).conns[(genome as any).conns.length-1].enabled = false;
(genome as any).conns.push(new ConnectionGene(config, 15,  8,  2));
(genome as any).conns.push(new ConnectionGene(config, 94,  8,  3));
(genome as any).conns[(genome as any).conns.length-1].enabled = false;
(genome as any).conns.push(new ConnectionGene(config, 36,  15, 8));
(genome as any).conns.push(new ConnectionGene(config, 0,   0,  2));
(genome as any).conns.push(new ConnectionGene(config, 84,  4,  3));
(genome as any).conns.push(new ConnectionGene(config, 139, 15, 4));
(genome as any).conns[(genome as any).conns.length-1].enabled = false;
(genome as any).conns.push(new ConnectionGene(config, 35,  3,  15));
(genome as any).conns.push(new ConnectionGene(config, 2,   1,  3));
(genome as any).conns.push(new ConnectionGene(config, 133, 3,  4));
(genome as any).conns.push(new ConnectionGene(config, 156, 15, 51));
(genome as any).conns.push(new ConnectionGene(config, 157, 51, 4));
(genome as any).conns.push(new ConnectionGene(config, 3,   3,  2));

Log.Genome(genome);
let network = new DNeuralNetwork(genome);

console.log((network as any).steps);