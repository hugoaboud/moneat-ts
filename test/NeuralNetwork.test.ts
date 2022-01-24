// import { Activation } from "../src/Activation";
// import { Genome } from "../src/Genome";
// import { DNeuralNetwork } from "../src/neuralnetwork/Default";
// import * as Config from "./test.config";

// describe('Build', () => {

//     test('Should build empty nodes and activations list', async () => {
//         let genome = new Genome(Config.Genome());
//         let nodes = genome.getNodes();
//         let conns = genome.getConns();
//         genome.AddConnection(nodes[0], nodes[3]);
//         genome.AddConnection(nodes[1], nodes[4]);
//         genome.AddConnection(nodes[2], nodes[5]);
//         genome.AddNode(conns[0]);
//         genome.AddNode(conns[1]);
//         genome.AddNode(conns[2]);
//         let network = new DNeuralNetwork(genome);
//         expect((network as any).nodes).toEqual([0,0,0,0,0,0,0,0,0]);
//         expect((network as any).actvs).toEqual([undefined,undefined,undefined,Activation.Linear,Activation.Linear,Activation.Linear,Activation.Linear,Activation.Linear,Activation.Linear]);
//     });

//     //  0 → 4 → 3
//     //  1 ↗ ↑
//     //      2
//     test('Should build step (as number list) from node and connections', async () => {
//         let genome = new Genome(Config.Genome({
//             outputs: 1
//         }));
//         let nodes = genome.getNodes();
//         let conns = genome.getConns();
//         genome.AddConnection(nodes[0], nodes[3]);
//         genome.AddNode(conns[0]); // 4
//         genome.AddConnection(nodes[1], nodes[4]);
//         genome.AddConnection(nodes[2], nodes[4]);
//         let network = new DNeuralNetwork(genome);
//         let step = (network as any).BuildStep(nodes[4], [conns[1],conns[3],conns[4]]);
//         expect(step[0]).toEqual(3);
//         expect(step[1]).toEqual(0);
//         expect(step[2]).toEqual(conns[1].weight.value);
//         expect(step[3]).toEqual(1);
//         expect(step[4]).toEqual(conns[3].weight.value);
//         expect(step[5]).toEqual(2);
//         expect(step[6]).toEqual(conns[4].weight.value);
//         expect(step[7]).toEqual(nodes[4].mult.value);
//         expect(step[8]).toEqual(nodes[4].bias.value);
//         expect(step[9]).toEqual(4);
//     });

//     // 0 → 2 → 1
//     //     ↻  
//     test('Should build loopback step', async () => {
//         let genome = new Genome(Config.Genome({
//             inputs: 1,
//             outputs: 1
//         }));
//         let nodes = genome.getNodes();
//         let conns = genome.getConns();
//         genome.AddConnection(nodes[0], nodes[1]);
//         genome.AddNode(conns[0]);
//         genome.AddConnection(nodes[2], nodes[2]);
//         let network = new DNeuralNetwork(genome);
//         let step = (network as any).BuildStep(nodes[2], [conns[1],conns[3]]);
//         expect(step[0]).toEqual(2);
//         expect(step[1]).toEqual(0);
//         expect(step[2]).toEqual(conns[1].weight.value);
//         expect(step[3]).toEqual(2);
//         expect(step[4]).toEqual(conns[3].weight.value);
//         expect(step[5]).toEqual(nodes[2].mult.value);
//         expect(step[6]).toEqual(nodes[2].bias.value);
//         expect(step[7]).toEqual(2);
//     });

// })

// describe('Calc', () => {

//     test('Should fail for wrong input data length', async () => {
//         let genome = new Genome(Config.Genome());
//         let network = new DNeuralNetwork(genome);
//         expect(() => {
//             network.Run([0])
//         }).toThrow('E_NETWORK: Wrong input data length. expected: 3, received: 1')
//     });

//     // 0 → 1
//     test('Should calculate simple I1->O1 network', async () => {
//         let genome = new Genome(Config.Genome({
//             inputs: 1,
//             outputs: 1
//         }));
//         let nodes = genome.getNodes();
//         let conns = genome.getConns();
//         genome.AddConnection(nodes[0], nodes[1]);
//         let network = new DNeuralNetwork(genome);
//         let output = network.Run([1]);
//         expect(output).toEqual([1*conns[0].weight.value*nodes[1].mult.value + nodes[1].bias.value]);
//     });

//     // 0 → 4 → 2
//     //   ↗   ↘
//     // 1 → 5 → 3
//     test('Should calculate 2in,2hidden,2out feedforward network', async () => {
//         let genome = new Genome(Config.Genome({
//             inputs: 2,
//             outputs: 2
//         }));
//         let nodes = genome.getNodes();
//         let conns = genome.getConns();
//         genome.AddConnection(nodes[0], nodes[2]);
//         genome.AddConnection(nodes[1], nodes[3]);
//         genome.AddNode(conns[0]); // 4
//         genome.AddNode(conns[1]); // 5
//         genome.AddConnection(nodes[1], nodes[4]);
//         genome.AddConnection(nodes[4], nodes[3]);
//         let network = new DNeuralNetwork(genome);
//         let output = network.Run([1,2]);
//         let n4 = (1*conns[2].weight.value + 2*conns[6].weight.value)*nodes[4].mult.value + nodes[4].bias.value;
//         let n5 = (2*conns[4].weight.value)*nodes[5].mult.value + nodes[5].bias.value;
//         expect(output[0]).toEqual((n4*conns[3].weight.value)*nodes[2].mult.value + nodes[2].bias.value);
//         expect(output[1]).toEqual((n4*conns[7].weight.value + n5*conns[5].weight.value)*nodes[3].mult.value + nodes[3].bias.value);
//     });

//     // 0 → 4 → 2
//     //   ↗ ↓
//     // 1 → 5 → 3
//     test('Should calculate 2in,2hidden,2out recurrent network', async () => {
//         let genome = new Genome(Config.Genome({
//             inputs: 2,
//             outputs: 2
//         }));
//         let nodes = genome.getNodes();
//         let conns = genome.getConns();
//         genome.AddConnection(nodes[0], nodes[2]);
//         genome.AddConnection(nodes[1], nodes[3]);
//         genome.AddNode(conns[0]); // 4
//         genome.AddNode(conns[1]); // 5
//         genome.AddConnection(nodes[1], nodes[4]);
//         genome.AddConnection(nodes[4], nodes[5]);
//         let network = new DNeuralNetwork(genome);
//         let output = network.Run([1,2]);
//         let n4 = (1*conns[2].weight.value + 2*conns[6].weight.value)*nodes[4].mult.value + nodes[4].bias.value;
//         let n5 = (n4*conns[7].weight.value + 2*conns[4].weight.value)*nodes[5].mult.value + nodes[5].bias.value;
//         expect(output[0]).toBeCloseTo((n4*conns[3].weight.value)*nodes[2].mult.value + nodes[2].bias.value);
//         expect(output[1]).toBeCloseTo((n5*conns[5].weight.value)*nodes[3].mult.value + nodes[3].bias.value);
//     });

// })

// describe('Compile', () => {

//     test.skip('Should compile network to a file with it\'s id', async () => {

//     });

//     test.skip('Compiled simple I1->O1 network should return the same result as the runtime version', async () => {

//     });

//     test.skip('Compiled 2in,2hidden,2out feedforward network should return the same result as the runtime version', async () => {

//     });

//     test.skip('Compiled 2in,2hidden,2out recurrent network should return the same result as the runtime version', async () => {

//     });

// })