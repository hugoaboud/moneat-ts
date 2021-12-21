import { Activation } from "../src/Activation";
import { Genome, Innovation } from "../src/Genome";
import { Genome as Config } from "./config";


describe('Innovation', () => {
    test('Global innovation number should start at 0', async () => {
        expect(Innovation.last).toBe(0);
    });

    test('Global innovation number should grow at each call', async () => {
        expect(Innovation.new).toBe(1);
        expect(Innovation.new).toBe(2);
    });

})

describe('Constructor', () => {

    test('Should fail for inputs <= 0', async () => {
        expect(() => {
            new Genome(Config(),0,1);
        }).toThrowError('E_GENOME: Number of input nodes should be greater than 0');
    });

    test('Should fail for outputs <= 0', async () => {
        expect(() => {
            new Genome(Config(),1,0);
        }).toThrowError('E_GENOME: Number of output nodes should be greater than 0');
    });

    test('Should fail for empty output activation options', async () => {
        expect(() => {
            new Genome(Config({
                activation: {
                    output: []
                }
            }),1,1);
        }).toThrowError('E_ACTIVATION: Trying to pick random activation from empty options list');
    });

    test('Should create input and output nodes', async () => {
        let genome = new Genome(Config(),3,2);
        let nodes = genome.nodeGenes;
        expect(nodes).toHaveLength(5);
        for (let i = 0; i < 3; i++) {
            expect(nodes[i].type).toBe('input');
        }
        for (let i = 3; i < 5; i++) {
            expect(nodes[i].type).toBe('output');
            expect(nodes[i].activation).toBe(Activation.Linear);
        }
        let connections = genome.connectionGenes;
        expect(connections).toHaveLength(0);
    });

})

describe('MutateAddConnection', () => {

    test('Should fail for output node as in_node', async () => {
        let genome = new Genome(Config(),3,3);
        expect(() => {
            genome.MutateAddConnection(genome.nodeGenes[3],genome.nodeGenes[0]);
        }).toThrowError('E_GENOME: Connection can\'t be created from an output node');
    });

    test('Should fail for input node as out_node', async () => {
        let genome = new Genome(Config(),3,3);
        expect(() => {
            genome.MutateAddConnection(genome.nodeGenes[0],genome.nodeGenes[0]);
        }).toThrowError('E_GENOME: Connection can\'t be created to an input node');
    });

    test('Should add a connection', async () => {
        let genome = new Genome(Config(),3,3);
        genome.MutateAddConnection(genome.nodeGenes[0],genome.nodeGenes[3]);
        
        let connections = genome.connectionGenes;
        expect(connections.length).toBe(1);
        expect(connections[0].enabled).toBe(true);
        expect(connections[0].innovation).toBe(Innovation.last);
    });

    test('Should fail for duplicate connection', async () => {
        let genome = new Genome(Config(),3,3);
        genome.MutateAddConnection(genome.nodeGenes[0],genome.nodeGenes[3]);
        expect(() => {
            genome.MutateAddConnection(genome.nodeGenes[0],genome.nodeGenes[3]);
        }).toThrowError('E_GENOME: Can\'t create duplicate connection');
    });

})

describe('MutateAddNode', () => {

    test('Should disable old connection', async () => {
        let genome = new Genome(Config(),3,3);
        genome.MutateAddConnection(genome.nodeGenes[0],genome.nodeGenes[3]);
        genome.MutateAddNode(genome.connectionGenes[0]);
        
        expect(genome.connectionGenes[0].enabled).toBe(false);
    });

    test('Should fail for empty hidden activation options', async () => {
        let genome = new Genome({
            ...Config(),
            activation: {
                ...Config().activation,
                hidden: []
            }
        },3,3);
        genome.MutateAddConnection(genome.nodeGenes[0],genome.nodeGenes[3]);
        expect(() => {
            genome.MutateAddNode(genome.connectionGenes[0]);
        }).toThrowError('E_ACTIVATION: Trying to pick random activation from empty options list');
    });

    test('Should create a node', async () => {
        let genome = new Genome(Config(),3,3);
        genome.MutateAddConnection(genome.nodeGenes[0],genome.nodeGenes[3]);
        genome.MutateAddNode(genome.connectionGenes[0]);
        
        expect(genome.nodeGenes[6]).toBeDefined();
        expect(genome.nodeGenes[6].type).toBe('hidden');
    });

    test('Should create two connections, to and from the node', async () => {
        let genome = new Genome(Config(),3,3);
        genome.MutateAddConnection(genome.nodeGenes[0],genome.nodeGenes[3]);
        genome.MutateAddNode(genome.connectionGenes[0]);
        
        expect(genome.connectionGenes[1]).toBeDefined();
        expect(genome.connectionGenes[1].in_node).toBe(genome.nodeGenes[0]);
        expect(genome.connectionGenes[1].out_node).toBe(genome.nodeGenes[6]);
        expect(genome.connectionGenes[1].enabled).toBe(true);
        expect(genome.connectionGenes[2]).toBeDefined();
        expect(genome.connectionGenes[2].in_node).toBe(genome.nodeGenes[6]);
        expect(genome.connectionGenes[2].out_node).toBe(genome.nodeGenes[3]);
        expect(genome.connectionGenes[2].enabled).toBe(true);
    });

})