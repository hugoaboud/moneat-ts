// import { Genome } from "../src/Genome";
// import { Graph } from "../src/Graph";
// import Log from "../src/util/Log";
// import * as Config from "./config";

// describe('Walk', () => {

//     describe('Input', () => {

//         test('Should return inputs on first walk (3 inputs, no connections)', async () => {
//             let genome = new Genome(Config.Genome());
//             let graph = new Graph(genome);
//             let inputs = graph.Walk();
//             let nodes = Object.values(genome.getNodes());
//             expect(inputs.map(n => n.gene)).toEqual(nodes.slice(0,3))            
//         });
    
//         test('Should return inputs on first walk (16 inputs, random connections)', async () => {
//             let genome = new Genome(Config.Genome({
//                 inputs: 16
//             }));
//             for (let i = 0; i < 100; i++) {
//                 let pair = genome.RandomNodePair();
//                 try {
//                     genome.AddConnection(pair[0], pair[1]);
//                 } catch (e) {}
//             }
//             let graph = new Graph(genome);
//             let inputs = graph.Walk();
//             let nodes = Object.values(genome.getNodes());
//             expect(inputs.map(n => n.gene)).toEqual(nodes.slice(0,16))
//         });
    
//     })

//     describe('Layers', () => {

//         // 0 → 2
//         // 1 → 3
//         test('Should walk simple I1->O1,I2->O2 graph', async () => {
//             let genome = new Genome(Config.Genome({
//                 inputs: 2,
//                 outputs: 2
//             }));
//             let nodes = Object.values(genome.getNodes());
//             genome.AddConnection(nodes[0], nodes[2]);
//             genome.AddConnection(nodes[1], nodes[3]);
//             let graph = new Graph(genome);
//             let inputs = graph.Walk();
//             expect(inputs.map(n => n.gene)).toEqual(nodes.slice(0,2))
//             let layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(nodes.slice(2,4))
//         });

//         // 0 → 4 → 2
//         // 1 → 5 → 3
//         test('Should walk 2in,2hidden,2out feedforward graph', async () => {
//             let genome = new Genome(Config.Genome({
//                 inputs: 2,
//                 outputs: 2
//             }));
//             let nodes = genome.getNodes();
//             let conns = genome.getConns();
//             genome.AddConnection(nodes[0], nodes[2]);
//             genome.AddConnection(nodes[1], nodes[3]);
//             genome.AddNode(conns[0]); // 4
//             genome.AddNode(conns[1]); // 5
//             let graph = new Graph(genome);
//             let inputs = graph.Walk();
//             expect(inputs.map(n => n.gene)).toEqual(Object.values(nodes).slice(0,2))
//             let layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(4,6))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[2]],[conns[4]]])
//             layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(2,4))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[3]],[conns[5]]])
//         });

//         // 0 ↛ 4 → 2
//         // 1 → 5 → 3
//         test('Should ignore disabled connections', async () => {
//             let genome = new Genome(Config.Genome({
//                 inputs: 2,
//                 outputs: 2
//             }));
//             let nodes = genome.getNodes();
//             let conns = genome.getConns();
//             genome.AddConnection(nodes[0], nodes[2]);
//             genome.AddConnection(nodes[1], nodes[3]);
//             genome.AddNode(conns[0]); // 4
//             genome.AddNode(conns[1]); // 5
//             conns[2].enabled.value = false;
//             let graph = new Graph(genome);
//             let inputs = graph.Walk();
//             expect(inputs.map(n => n.gene)).toEqual(Object.values(nodes).slice(0,2))
//             let layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(5,6))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[4]]])
//             layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(3,4))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[5]]])
//         });

//         // 0 → 2 → 3 → 1
//         //     ↻   ↻
//         test('Should walk through a loopback node only once', async () => {
//             let genome = new Genome(Config.Genome({
//                 inputs: 1,
//                 outputs: 1
//             }));
//             let nodes = genome.getNodes();
//             let conns = genome.getConns();
//             genome.AddConnection(nodes[0], nodes[1]);
//             genome.AddNode(conns[0]); // 2
//             genome.AddNode(conns[2]); // 3
//             genome.AddConnection(nodes[2], nodes[2]);
//             genome.AddConnection(nodes[3], nodes[3]);
//             let graph = new Graph(genome);
//             let inputs = graph.Walk();
//             expect(inputs.map(n => n.gene)).toEqual(Object.values(nodes).slice(0,1))
//             let layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(2,3))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[1],conns[5]]])
//             layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(3,4))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[3],conns[6]]])
//             layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(1,2))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[4]]])
//         });


//         // 0 → 4 → → 6 → 2
//         //      ↖   ↙
//         // 1 →  → 5 →  → 3
//         test('Should walk 2in,2hidden,2out recurrent graph', async () => {
//             let genome = new Genome(Config.Genome({
//                 inputs: 2,
//                 outputs: 2
//             }));
//             let nodes = genome.getNodes();
//             let conns = genome.getConns();
//             genome.AddConnection(nodes[0], nodes[2]);
//             genome.AddConnection(nodes[1], nodes[3]);
//             genome.AddNode(genome.getConns()[0]); // 4
//             genome.AddNode(genome.getConns()[1]); // 5
//             genome.AddNode(genome.getConns()[3]); // 6
//             genome.AddConnection(nodes[6], nodes[5]);
//             genome.AddConnection(nodes[5], nodes[4]);
//             let graph = new Graph(genome);
//             let inputs = graph.Walk();
//             expect(inputs.map(n => n.gene)).toEqual(Object.values(nodes).slice(0,2))
//             let layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(4,6))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[2],conns[9]],[conns[4],conns[8]]])
//             layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual([nodes[3],nodes[6]])
//             expect(layer.map(n => n.inputs)).toEqual([[conns[5]],[conns[6]]])
//             layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(2,3))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[7]]])
//         });

//         // 0 →  4  → 2
//         //     ↑ ↓
//         // 1 →  5  → 3
//         test('Should handle mutual recurrence', async () => {
//             let genome = new Genome(Config.Genome({
//                 inputs: 2,
//                 outputs: 2
//             }));
//             let nodes = genome.getNodes();
//             let conns = genome.getConns();
//             genome.AddConnection(nodes[0], nodes[2]);
//             genome.AddConnection(nodes[1], nodes[3]);
//             genome.AddNode(genome.getConns()[0]); // 4
//             genome.AddNode(genome.getConns()[1]); // 5
//             genome.AddConnection(nodes[4], nodes[5]);
//             genome.AddConnection(nodes[5], nodes[4]);
//             let graph = new Graph(genome);
//             let inputs = graph.Walk();
//             expect(inputs.map(n => n.gene)).toEqual(Object.values(nodes).slice(0,2))
//             let layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(4,6))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[2],conns[7]],[conns[4],conns[6]]])
//             layer = graph.Walk();
//             expect(layer.map(n => n.gene)).toEqual(Object.values(nodes).slice(2,4))
//             expect(layer.map(n => n.inputs)).toEqual([[conns[3]],[conns[5]]]) 
//         });
//     })

// })