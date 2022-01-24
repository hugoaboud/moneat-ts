import { Activation } from "../src/Activation";
import { Genome } from "../src/Genome";
import { DNeuralNetwork } from "../src/neuralnetwork/Default";
import * as Config from "./test.config";

describe('Default', () => {

    describe('BuildStep', () => {

        test('Should build a step with 1 input', () => {

            let genome = new Genome(Config.Genome({
                inputs: 2,
                outputs: 2
            }));
            let nodes = Object.values(genome.getNodes());
            let conns = genome.getConns();
            genome.AddConnection(nodes[0], nodes[2]);

            let network = new DNeuralNetwork(genome);
            let node = (network as any).graph.nodes[2];
            let step = (network as any).BuildStep(node);

            expect(step.length).toEqual(6);
            expect(step[0]).toEqual(1);
            expect(step[1]).toEqual(0);
            expect(step[2]).toEqual(conns[0].weight.value);
            expect(step[3]).toEqual(nodes[2].mult.value);
            expect(step[4]).toEqual(nodes[2].bias.value);
            expect(step[5]).toEqual(2);
        })

        test('Should build a step with 2 inputs', () => {
            let genome = new Genome(Config.Genome({
                inputs: 2,
                outputs: 2
            }));
            let nodes = Object.values(genome.getNodes());
            let conns = genome.getConns();
            genome.AddConnection(nodes[0], nodes[2]);
            genome.AddConnection(nodes[1], nodes[2]);

            let network = new DNeuralNetwork(genome);
            let node = (network as any).graph.nodes[2];
            let step = (network as any).BuildStep(node);

            expect(step.length).toEqual(8);
            expect(step[0]).toEqual(2);
            expect(step[1]).toEqual(0);
            expect(step[2]).toEqual(conns[0].weight.value);
            expect(step[3]).toEqual(1);
            expect(step[4]).toEqual(conns[1].weight.value);
            expect(step[5]).toEqual(nodes[2].mult.value);
            expect(step[6]).toEqual(nodes[2].bias.value);
            expect(step[7]).toEqual(2);
        })

    })

    describe('Build', () => {

        test.skip('Should build nodes from genome', () => {    
        })

        test.skip('Should build steps from sorted graph', () => {    
        })

    })

    describe('Reset', () => {

        test.skip('Should zero the network state', () => {    
        })

    })

    describe('Calc', () => {


    })



})