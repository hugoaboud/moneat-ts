import { Activation } from "../src/Activation";
import { BooleanAttribute, NumericAttribute } from "../src/Attribute";
import { ConnectionGene, NodeGene } from "../src/Gene";
import { Genome } from "../src/Genome";
import { ConnInnovation, NodeInnovation } from "../src/Innovation";
import Log from "../src/util/Log";
import { Genome as Config } from "./test.config";


describe('Node Gene', () => {

    describe('Factory Methods', () => {

        test('NewIO: Should create input node gene', async () => {
            let config = Config();
            let node = NodeGene.NewIO(config, 0, 'input');
            expect(node.id).toEqual(NodeInnovation.Last());
            expect(node.type).toEqual('input');
            expect(node.actv).toBeUndefined();
            expect(node.bias).toBeInstanceOf(NumericAttribute);
            expect(node.mult).toBeInstanceOf(NumericAttribute);
        });

        test('NewIO: Should create output node gene', async () => {
            let config = Config();
            let node = NodeGene.NewIO(config, 0, 'output');
            expect(node.id).toEqual(NodeInnovation.Last());
            expect(node.type).toEqual('output');
            expect(node.actv).toEqual(config.activation.hidden[0]);
            expect(node.bias).toBeInstanceOf(NumericAttribute);
            expect(node.mult).toBeInstanceOf(NumericAttribute);
        });

        test('NewHidden: Should create hidden node gene', async () => {
            let config = Config();
            let conn = new ConnectionGene(config, 0, 0, 1);
            let node = NodeGene.NewHidden(config, conn);
            expect(node.id).toEqual(NodeInnovation.Last());
            expect(node.type).toEqual('hidden');
            expect(node.actv).toEqual(config.activation.hidden[0]);
            expect(node.bias).toBeInstanceOf(NumericAttribute);
            expect(node.mult).toBeInstanceOf(NumericAttribute);
        });

    })

    describe('Lifecycle', () => {

        test('Mutate: Should mutate bias and mult attributes', async () => {
            let node = NodeGene.NewIO(Config(), 0, 'input');
            let bias_mutate = jest.spyOn(node.bias, 'Mutate')
            let mult_mutate = jest.spyOn(node.mult, 'Mutate')
            node.Mutate();
            expect(bias_mutate).toHaveBeenCalled();
            expect(mult_mutate).toHaveBeenCalled();
        })

        test('Clone: Attributes should not reference original', async () => {
            let node = NodeGene.NewIO(Config(), 0, 'input');
            let clone = node.Clone();
            expect(node.bias).not.toBe(clone.bias);
            expect(node.mult).not.toBe(clone.mult);
        })

        test('Distance: Should calculate from parameters difference', async () => {
            let config = Config();
            let node1 = NodeGene.NewIO(config, 0, 'input');
            let node2 = NodeGene.NewIO(config, 1, 'input');
            let dist = node1.Distance(node2);
            let expected = Math.abs(node1.bias.value - node2.bias.value) + Math.abs(node1.mult.value - node2.mult.value);
            expect(dist).toBeCloseTo(expected);
        });

        test('Crossover: Should not reference parent attributes', async () => {
            let config = Config();
            let node1 = NodeGene.NewIO(config, 0, 'input');
            let node2 = NodeGene.NewIO(config, 1, 'input');
            let child = node1.Crossover(node2);
            expect(child.bias).not.toBe(node1.bias);
            expect(child.mult).not.toBe(node1.mult);
            expect(child.bias).not.toBe(node2.bias);
            expect(child.mult).not.toBe(node2.mult);
        });

        test('Crossover: Should take bias from peer 50% of the runs', async () => {
            let config = Config();
            let node1 = NodeGene.NewIO(config, 0, 'input');
            let node2 = NodeGene.NewIO(config, 1, 'input');
            function crossover() {
                node1.bias.value = -1;
                node2.bias.value = 1;
                let child = node1.Crossover(node2);
                return child.bias.value > 0;
            }
            let steps = 10000;
            let peer_params = 0;
            for (let i = 0; i < steps; i++) {
                if (crossover()) peer_params++;
            }
            expect(peer_params/steps).toBeCloseTo(0.5, 1);
        });

        test('Crossover: Should take mult from peer 50% of the runs', async () => {
            let config = Config();
            let node1 = NodeGene.NewIO(config, 0, 'input');
            let node2 = NodeGene.NewIO(config, 1, 'input');
            function crossover() {
                node1.mult.value = -1;
                node2.mult.value = 1;
                let child = node1.Crossover(node2);
                return child.mult.value > 0;
            }
            let steps = 10000;
            let peer_params = 0;
            for (let i = 0; i < steps; i++) {
                if (crossover()) peer_params++;
            }
            expect(peer_params/steps).toBeCloseTo(0.5, 1);
        });

    })

})

describe('Connection Gene', () => {

    describe('Factory', () => {

        test('New: Should create connection gene', async () => {
            let config = Config();
            let node = ConnectionGene.New(config, 0, 1);
            expect(node.id).toEqual(ConnInnovation.Last());
            expect(node.enabled).toBeInstanceOf(BooleanAttribute);
            expect(node.weight).toBeInstanceOf(NumericAttribute);
        });

    })

    describe('Lifecycle', () => {

        test('Mutate: Should mutate enabled and weight attributes', async () => {
            let node = ConnectionGene.New(Config(), 0, 1);
            let enabled_mutate = jest.spyOn(node.enabled, 'Mutate')
            let weight_mutate = jest.spyOn(node.weight, 'Mutate')
            node.Mutate();
            expect(enabled_mutate).toHaveBeenCalled();
            expect(weight_mutate).toHaveBeenCalled();
        })

        test('Clone: Attributes should not reference original', async () => {
            let node = ConnectionGene.New(Config(), 0, 1);
            let clone = node.Clone();
            expect(node.enabled).not.toBe(clone.enabled);
            expect(node.weight).not.toBe(clone.weight);
        })

        test('Distance: Should calculate from parameters difference', async () => {
            let config = Config();
            let node1 = ConnectionGene.New(config, 0, 1);
            let node2 = ConnectionGene.New(config, 0, 2);
            let dist = node1.Distance(node2);
            let expected = Math.abs(node1.weight.value - node2.weight.value);
            expect(dist).toBeCloseTo(expected);
        });

        test('Crossover: Should not reference parent attributes', async () => {
            let config = Config();
            let node1 = ConnectionGene.New(config, 0, 1);
            let node2 = ConnectionGene.New(config, 0, 2);
            let child = node1.Crossover(node2);
            expect(child.enabled).not.toBe(node1.enabled);
            expect(child.weight).not.toBe(node1.weight);
            expect(child.enabled).not.toBe(node2.enabled);
            expect(child.weight).not.toBe(node2.weight);
        });

        test('Crossover: Should take bias from peer 50% of the runs', async () => {
            let config = Config();
            let node1 = ConnectionGene.New(config, 0, 1);
            let node2 = ConnectionGene.New(config, 0, 2);
            function crossover() {
                node1.enabled.value = false;
                node2.enabled.value = true;
                let child = node1.Crossover(node2);
                return child.enabled.value;
            }
            let steps = 10000;
            let peer_params = 0;
            for (let i = 0; i < steps; i++) {
                if (crossover()) peer_params++;
            }
            expect(peer_params/steps).toBeCloseTo(0.5, 1);
        });

        test('Crossover: Should take mult from peer 50% of the runs', async () => {
            let config = Config();
            let node1 = ConnectionGene.New(config, 0, 1);
            let node2 = ConnectionGene.New(config, 0, 2);
            function crossover() {
                node1.weight.value = -1;
                node2.weight.value = 1;
                let child = node1.Crossover(node2);
                return child.weight.value > 0;
            }
            let steps = 10000;
            let peer_params = 0;
            for (let i = 0; i < steps; i++) {
                if (crossover()) peer_params++;
            }
            expect(peer_params/steps).toBeCloseTo(0.5, 1);
        });

    })

})