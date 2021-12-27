import { Activation } from "../src/Activation";
import { ConnectionGene, Genome, Innovation } from "../src/Genome";
import Log from "../src/util/Log";
import { Genome as Config } from "./config";


describe('Innovation', () => {
    test('Global innovation number should start at 0', async () => {
        expect(Innovation.Last()).toBe(0);
    });

    test('Global innovation number should grow at each call', async () => {
        expect(Innovation.New()).toBe(1);
        expect(Innovation.New()).toBe(2);
    });

})

describe('Constructor', () => {

    test('Should fail for inputs <= 0', async () => {
        expect(() => {
            new Genome(Config({
                inputs: 0
            }));
        }).toThrowError('E_GENOME: (config) Number of input nodes should be greater than 0');
    });

    test('Should fail for outputs <= 0', async () => {
        expect(() => {
            new Genome(Config({
                outputs: 0
            }));
        }).toThrowError('E_GENOME: (config) Number of output nodes should be greater than 0');
    });

    test('Should fail for empty hidden activation function', async () => {
        expect(() => {
            new Genome(Config({
                activation: {
                    hidden: []
                }
            }));
        }).toThrowError('E_GENOME: (config) You should define at least one hidden activation function');
    });

    test('Should fail for empty output activation function', async () => {
        expect(() => {
            new Genome(Config({
                activation: {
                    output: []
                }
            }));
        }).toThrowError('E_GENOME: (config) You should define at least one output activation function');
    });

    test('Should create input and output nodes', async () => {
        let genome = new Genome(Config());
        let nodes = Object.values(genome.getNodes());
        expect(nodes).toHaveLength(6);
        for (let i = 0; i < 3; i++) {
            expect(nodes[i].type).toBe('input');
        }
        for (let i = 3; i < 6; i++) {
            expect(nodes[i].type).toBe('output');
            expect(nodes[i].activation).toBe(Activation.Linear);
        }
        let connections = genome.getConns();
        expect(connections).toHaveLength(0);
    });

})

describe ('Historical Gene Matching', () => {

    describe('MatchGenes', () => {

        const TGene = (innovation: number) => ({
            in_node: null as any,
            out_node: null as any,
            enabled: true,
            weight: null as any,
            innovation
        } as ConnectionGene );
        const TGenome = (genes: ConnectionGene[]) => {
            let genome = new Genome(Config());
            (genome as any).conns = genes;
            return genome;
        }
        const TMatch = () => {
            let a = TGenome([TGene(0),TGene(1),TGene(5),TGene(3)]);
            let b = TGenome([TGene(3),TGene(2),TGene(4),TGene(1)]);
            return a.MatchGenes(b);
        }

        test('Should get innovation ranges for both lists', async () => {
            let a = [TGene(0),TGene(1),TGene(5),TGene(3)];
            let b = [TGene(3),TGene(2),TGene(4),TGene(1)];
            let ranges = Innovation.Ranges(a,b);
            expect(ranges.a).toEqual([0,5])
            expect(ranges.b).toEqual([1,4])
        });
    
        test('Should return matching genes of both genomes', async () => {
            let match = TMatch();
            let matching = match.matching.map(m => m.map(ab => ab.innovation));
            expect(matching).toEqual([[1,1],[3,3]])
        });
    
        test('Should return disjoint genes of both genomes', async () => {
            let match = TMatch();
            let disjoint = match.disjoint.map(m => m.innovation);
            expect(disjoint).toEqual([0,5])
        });
    
        test('Should return excess genes of both genomes', async () => {
            let match = TMatch();
            let excess = match.excess.map(m => m.innovation);
            expect(excess).toEqual([2,4])
        });
    
    });
})

describe('Mutation', () => {

    describe('AddConnection', () => {

        test('Should fail for output node as in_node', async () => {
            let genome = new Genome(Config());
            expect(() => {
                genome.AddConnection(genome.getNodes()[3],genome.getNodes()[0]);
            }).toThrowError('E_GENOME: Connection can\'t be created from an output node');
        });
    
        test('Should fail for input node as out_node', async () => {
            let genome = new Genome(Config());
            expect(() => {
                genome.AddConnection(genome.getNodes()[0],genome.getNodes()[0]);
            }).toThrowError('E_GENOME: Connection can\'t be created to an input node');
        });
    
        test('Should fail for duplicate connection', async () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            expect(() => {
                genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            }).toThrowError('E_GENOME: Can\'t create duplicate connection');
        });
    
        test.skip('Should fail for immediate recurrent connection on feed-forward genomes', async () => {
            
        });
    
        test.skip('Should fail for transitive recurrent connection on feed-forward genomes', async () => {
            
        });
    
        test('Should add a connection', async () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            
            let connections = genome.getConns();
            expect(connections.length).toBe(1);
            expect(connections[0].enabled).toBe(true);
            expect(connections[0].innovation).toBe(Innovation.Last());
        });
    
    })
    
    describe('RemoveConnection', () => {
    
        test('Should remove connection gene from genome', async () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            genome.AddConnection(genome.getNodes()[1],genome.getNodes()[3]);
            expect(genome.getConns().length).toBe(2);
            genome.RemoveConnection(genome.getConns()[0]);
            expect(genome.getConns().length).toBe(1);
        });
    
    });
    
    describe('AddNode', () => {
    
        test('Should fail for disabled connection', async () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            let conn = genome.getConns()[0];
            conn.enabled = false;
            expect(() => {
                genome.AddNode(conn);
            }).toThrowError('E_GENOME: Can\'t add a node to a disabled connection');
        });
    
        test('Should disable old connection', async () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            genome.AddNode(genome.getConns()[0]);
            
            expect(genome.getConns()[0].enabled).toBe(false);
        });
        
        test('Should create a node', async () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            genome.AddNode(genome.getConns()[0]);
            
            expect(genome.getNodes()[6]).toBeDefined();
            expect(genome.getNodes()[6].type).toBe('hidden');
        });
    
        test('Should create two connections, to and from the node', async () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            genome.AddNode(genome.getConns()[0]);
            
            expect(genome.getConns()[1]).toBeDefined();
            expect(genome.getConns()[1].in_node).toBe(genome.getNodes()[0]);
            expect(genome.getConns()[1].out_node).toBe(genome.getNodes()[6]);
            expect(genome.getConns()[1].enabled).toBe(true);
            expect(genome.getConns()[2]).toBeDefined();
            expect(genome.getConns()[2].in_node).toBe(genome.getNodes()[6]);
            expect(genome.getConns()[2].out_node).toBe(genome.getNodes()[3]);
            expect(genome.getConns()[2].enabled).toBe(true);
        });
    
    })
    
    describe('RemoveNode', () => {
    
        test('Should fail to remove input node', async () => {
            let genome = new Genome(Config());
            expect(() => {
                genome.RemoveNode(genome.getNodes()[0]);
            }).toThrowError('E_GENOME: Can\'t remove an input node');
        });
        
        test('Should fail to remove output node', async () => {
            let genome = new Genome(Config());
            expect(() => {
                genome.RemoveNode(genome.getNodes()[3]);
            }).toThrowError('E_GENOME: Can\'t remove an output node');
        });

        // 0 → 6(x) -> 7 → 3
        // 1               4
        // 2               5
        test('Should remove node gene from genome', async () => {
            let genome = new Genome(Config());
            let nodes = genome.getNodes();
            let conns = genome.getConns();
            genome.AddConnection(nodes[0],nodes[3]);
            genome.AddNode(conns[0]);
            genome.AddNode(conns[1]);
            expect(Object.keys(nodes).length).toBe(8);
            genome.RemoveNode(nodes[6]);
            expect(Object.keys(nodes).length).toBe(7);
        });
    
        // 0 → 6(x) → 3   
        // 1      ↘ → 4
        // 2      ↘ → 5
        test('Should remove all connections from/to node', async () => {
            let genome = new Genome(Config());
            let nodes = genome.getNodes();
            let conns = genome.getConns();
            genome.AddConnection(nodes[0],nodes[3]);
            genome.AddNode(conns[0]);
            genome.AddConnection(nodes[6],nodes[4]);
            genome.AddConnection(nodes[6],nodes[5]);
            expect(conns.length).toBe(5);
            genome.RemoveNode(nodes[6]);
            conns = genome.getConns();
            expect(conns.length).toBe(1);
        }); 
        
    });
})

describe('Clone', () => {

    test('Should create a new genome with new ID', async () => {
        let genome = new Genome(Config());
        let clone = genome.Clone();
        expect(clone).not.toBe(genome);
        expect(clone.getID()).not.toEqual(genome.getID());
    });

    test('Clone nodes should not reference original nodes', async () => {
        let genome = new Genome(Config());
        let clone = genome.Clone();
        let genome_nodes = genome.getNodes();
        let clone_nodes = clone.getNodes();
        Object.values(genome_nodes).map(genome_node => {
            let clone_node = clone_nodes[genome_node.id];
            expect(clone_node).not.toBe(genome_node);    
            if (clone_node.bias)
                expect(clone_node.bias).not.toBe(genome_node.bias);    
            if (clone_node.mult)
                expect(clone_node.mult).not.toBe(genome_node.mult);    
        })
    });

    test('Clone nodes should be equal to original nodes', async () => {
        let genome = new Genome(Config());
        let clone = genome.Clone();
        let genome_nodes = genome.getNodes();
        let clone_nodes = clone.getNodes();
        Object.values(genome_nodes).map(genome_node => {
            let clone_node = clone_nodes[genome_node.id];
            expect(clone_node.id).toEqual(genome_node.id);
            expect(clone_node.type).toEqual(genome_node.type);
            expect(clone_node.activation).toBe(genome_node.activation);
            if (clone_node.bias) expect(clone_node.bias.value).toEqual(genome_node.bias.value);
            if (clone_node.mult) expect(clone_node.mult.value).toEqual(genome_node.mult.value);
        })
    });

    test('Clone connections should not reference original connections', async () => {
        let genome = new Genome(Config());
        genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
        genome.AddConnection(genome.getNodes()[1],genome.getNodes()[4]);
        genome.AddConnection(genome.getNodes()[2],genome.getNodes()[5]);
        let clone = genome.Clone();
        for (let i = 0; i < genome.getConns().length; i++) {
            let genome_conn = genome.getConns()[i];
            let clone_conn = clone.getConns()[i];
            expect(clone_conn).not.toBe(genome_conn);    
            if (clone_conn.in_node) expect(clone_conn.in_node).not.toBe(genome_conn.in_node);
            if (clone_conn.out_node) expect(clone_conn.out_node).not.toBe(genome_conn.out_node);
            if (clone_conn.weight) expect(clone_conn.weight).not.toBe(genome_conn.out_node);
        }
    });

    test('Clone connections should be equal to original connections', async () => {
        let genome = new Genome(Config());
        genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
        genome.AddConnection(genome.getNodes()[1],genome.getNodes()[4]);
        genome.AddConnection(genome.getNodes()[2],genome.getNodes()[5]);
        let clone = genome.Clone();
        let genome_nodes = genome.getNodes();
        let clone_nodes = clone.getNodes();
        for (let i = 0; i < genome.getConns().length; i++) {
            let genome_conn = genome.getConns()[i];
            let clone_conn = clone.getConns()[i];
            expect(genome_conn.in_node.id).toEqual(clone_conn.in_node.id);
            expect(genome_conn.out_node.id).toEqual(clone_conn.out_node.id);
            expect(genome_conn.enabled).toEqual(clone_conn.enabled);
            expect(genome_conn.weight.value).toEqual(clone_conn.weight.value);
            expect(genome_conn.innovation).toEqual(clone_conn.innovation);
        }
    });

});

describe('Crossover', () => {

    test.skip('?', async () => {
        
    });

    // ... neat crossover stuff (innovation, etc)

});