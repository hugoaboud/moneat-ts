import { Genome } from "../src/Genome";
import { Graph } from "../src/Graph";
import { ConnInnovation, NodeInnovation } from "../src/Innovation";
import Log from "../src/util/Log";
import * as Config from "./test.config";

beforeEach(() => {
    (NodeInnovation as any).last = -1;
    NodeInnovation.ResetCache();
    (ConnInnovation as any).last = -1;
    ConnInnovation.ResetCache();
})

describe('Constructor', () => {

    test('Should create output graph nodes', () => {
        let genome = new Genome(Config.Genome());
        let graph = new Graph(genome);
        let genome_outputs = Object.values(genome.getOutputs());
        let graph_outputs = Object.values(graph.nodes).map(n => n.gene);
        expect(genome_outputs).toEqual(graph_outputs);
    })

    test('Should create input graph nodes', () => {
        let genome = new Genome(Config.Genome());
        let graph = new Graph(genome);
        let genome_inputs = Object.values(genome.getInputs());
        let graph_inputs = Object.values(graph.inputs).map(n => n.gene);
        expect(genome_inputs).toEqual(graph_inputs);
    })

    // 0 → 4 → → 6 → 2
    //      ↖   ↙
    // 1 →  → 5 →  → 3
    test('Should create hidden nodes and connections', () => {
        let genome = new Genome(Config.Genome({
            inputs: 2,
            outputs: 2
        }));
        let nodes = genome.getNodes();
        let conns = genome.getConns();
        genome.AddConnection(nodes[0], nodes[2]); // c:0
        genome.AddConnection(nodes[1], nodes[3]); // c:1
        genome.AddNode(genome.getConns()[0]); // n:4, c:2,3
        genome.AddNode(genome.getConns()[1]); // n:5, c:4,5
        genome.AddNode(genome.getConns()[3]); // n:6, c:6,7
        genome.AddConnection(nodes[6], nodes[5]); // c:8
        genome.AddConnection(nodes[5], nodes[4]); // c:9
        nodes = genome.getNodes();
        let graph = new Graph(genome);
        expect(graph.nodes[0].outputs[0]).toStrictEqual(nodes[4]);
        expect(graph.nodes[1].outputs[0]).toStrictEqual(nodes[5]);
        expect(graph.nodes[2].inputs[0]).toStrictEqual(conns[7]);
        expect(graph.nodes[3].inputs[0]).toStrictEqual(conns[5]);
        expect(graph.nodes[4].inputs[0]).toStrictEqual(conns[2]);
        expect(graph.nodes[4].inputs[1]).toStrictEqual(conns[9]);
        expect(graph.nodes[4].outputs[0]).toStrictEqual(nodes[6]);
        expect(graph.nodes[5].inputs[0]).toStrictEqual(conns[4]);
        expect(graph.nodes[5].inputs[1]).toStrictEqual(conns[8]);
        expect(graph.nodes[5].outputs[0]).toStrictEqual(nodes[3]);
        expect(graph.nodes[5].outputs[1]).toStrictEqual(nodes[4]);
        expect(graph.nodes[6].inputs[0]).toStrictEqual(conns[6]);
        expect(graph.nodes[6].outputs[0]).toStrictEqual(nodes[2]);
        expect(graph.nodes[6].outputs[1]).toStrictEqual(nodes[5]);
    })

})

describe('Node Sorting', () => {

    // 0 → 2
    // 1 → 3
    test.skip('Should sort simple I1->O1,I2->O2 graph', async () => {
        let genome = new Genome(Config.Genome({
            inputs: 2,
            outputs: 2
        }));
        let nodes = Object.values(genome.getNodes());
        genome.AddConnection(nodes[0], nodes[2]);
        genome.AddConnection(nodes[1], nodes[3]);
        let graph = new Graph(genome);
    });

    // 0 → 4 → 2
    // 1 → 5 → 3
    test.skip('Should sort 2in,2hidden,2out feedforward graph', async () => {
        let genome = new Genome(Config.Genome({
            inputs: 2,
            outputs: 2
        }));
        let nodes = genome.getNodes();
        let conns = genome.getConns();
        genome.AddConnection(nodes[0], nodes[2]);
        genome.AddConnection(nodes[1], nodes[3]);
        genome.AddNode(conns[0]); // 4
        genome.AddNode(conns[1]); // 5
        let graph = new Graph(genome);
    });

    // 0 → 4 → 2
    //   X   X
    // 1 → 5 → 3
    test.skip('Should sort 2in,2hidden,2out dense feedforward graph', async () => {
        let genome = new Genome(Config.Genome({
            inputs: 2,
            outputs: 2
        }));
        let nodes = genome.getNodes();
        let conns = genome.getConns();
        genome.AddConnection(nodes[0], nodes[2]);
        genome.AddConnection(nodes[1], nodes[3]);
        genome.AddNode(conns[0]); // 4
        genome.AddNode(conns[1]); // 5
        let graph = new Graph(genome);
    });

    // 0 ↛ 4 → 2
    // 1 → 5 → 3
    test.skip('Should ignore disabled connections', async () => {
        let genome = new Genome(Config.Genome({
            inputs: 2,
            outputs: 2
        }));
        let nodes = genome.getNodes();
        let conns = genome.getConns();
        genome.AddConnection(nodes[0], nodes[2]);
        genome.AddConnection(nodes[1], nodes[3]);
        genome.AddNode(conns[0]); // 4
        genome.AddNode(conns[1]); // 5
        conns[2].enabled.value = false;
        let graph = new Graph(genome);
    });

    // 0 → 2 → 3 → 1
    //     ↻   ↻
    test.skip('Should sort a loopback node only once', async () => {
        let genome = new Genome(Config.Genome({
            inputs: 1,
            outputs: 1
        }));
        let nodes = genome.getNodes();
        let conns = genome.getConns();
        genome.AddConnection(nodes[0], nodes[1]);
        genome.AddNode(conns[0]); // 2
        genome.AddNode(conns[2]); // 3
        genome.AddConnection(nodes[2], nodes[2]);
        genome.AddConnection(nodes[3], nodes[3]);
        let graph = new Graph(genome);
    });


    // 0 → 4 → → 6 → 2
    //      ↖   ↙
    // 1 →  → 5 →  → 3
    test.skip('Should sort 2in,2hidden,2out recurrent graph', async () => {
        let genome = new Genome(Config.Genome({
            inputs: 2,
            outputs: 2
        }));
        let nodes = genome.getNodes();
        let conns = genome.getConns();
        genome.AddConnection(nodes[0], nodes[2]);
        genome.AddConnection(nodes[1], nodes[3]);
        genome.AddNode(genome.getConns()[0]); // 4
        genome.AddNode(genome.getConns()[1]); // 5
        genome.AddNode(genome.getConns()[3]); // 6
        genome.AddConnection(nodes[6], nodes[5]);
        genome.AddConnection(nodes[5], nodes[4]);
        let graph = new Graph(genome);
    });

    // 0 →  4  → 2
    //     ↑ ↓
    // 1 →  5  → 3
    test.skip('Should handle mutual recurrence', async () => {
        let genome = new Genome(Config.Genome({
            inputs: 2,
            outputs: 2
        }));
        let nodes = genome.getNodes();
        let conns = genome.getConns();
        genome.AddConnection(nodes[0], nodes[2]);
        genome.AddConnection(nodes[1], nodes[3]);
        genome.AddNode(genome.getConns()[0]); // 4
        genome.AddNode(genome.getConns()[1]); // 5
        genome.AddConnection(nodes[4], nodes[5]);
        genome.AddConnection(nodes[5], nodes[4]);
        let graph = new Graph(genome);
    });

})