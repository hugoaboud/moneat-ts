import { Activation } from "../src/Activation";
import { Genome } from "../src/Genome";
import { ConnInnovation, NodeInnovation } from "../src/Innovation";
import { Genome as Config } from "./test.config";

beforeEach(() => {
    (NodeInnovation as any).last = -1;
    NodeInnovation.ResetCache();
    (ConnInnovation as any).last = -1;
    ConnInnovation.ResetCache();
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
            expect(nodes[i].actv).toBe(Activation.Linear);
        }
        let connections = genome.getConns();
        expect(connections).toHaveLength(0);
    });

    test('Input node IDs should start at 0', async () => {
        let genome = new Genome(Config());
        let nodes = Object.values(genome.getNodes());
        expect(nodes[0].id).toBe(0);
        expect(nodes[1].id).toBe(1);
        expect(nodes[2].id).toBe(2);
    });

    test('Output node IDs should start at number of inputs', async () => {
        let genome = new Genome(Config());
        let nodes = Object.values(genome.getNodes());
        expect(nodes[3].id).toBe(3);
        expect(nodes[4].id).toBe(4);
        expect(nodes[5].id).toBe(5);
    });

    test('Should not connect if initial connection prob is 0', async () => {
        let genome = new Genome(Config({
            initial_connection_prob: 0
        }));
        let conns = Object.values(genome.getConns());
        expect(conns).toHaveLength(0);
    });

    test('Should fully connect if initial connection prob is 1', async () => {
        let genome = new Genome(Config({
            initial_connection_prob: 1
        }));
        let conns = Object.values(genome.getConns());
        expect(conns).toHaveLength(9);
        let pairs = conns.map(c => [c.in_node, c.out_node]);
        expect(pairs).toEqual([[0,3],[0,4],[0,5],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5]])
    });

    test.skip('Should partially connect if 0 > prob < 1', async () => {
    });

})


describe ('Genome Distance', () => {

    describe('Nodes', () => {

        test('Should be 0 for clones', () => {
            let genome = new Genome(Config());
            let clone = genome.Clone();
            let dist = genome.Distance(clone);
            expect(dist.nodes.matching).toEqual(0)
            expect(dist.nodes.disjoint).toEqual(0)
            expect(dist.nodes.excess).toEqual(0)
        })

        test('Should be 0 for IO nodes', () => {
            let genome = new Genome(Config());
            let peer = genome.Clone();
            genome.getNodes()[0].bias.value = 0;
            genome.getNodes()[0].mult.value = 0;
            peer.getNodes()[0].bias.value = 10;
            peer.getNodes()[0].mult.value = 10;
            let dist = genome.Distance(peer);
            expect(dist.nodes.matching).toEqual(0)
            expect(dist.nodes.disjoint).toEqual(0)
            expect(dist.nodes.excess).toEqual(0)
        })

        test('Should calculate matching distance from genes distances', () => {          
            let genome = new Genome(Config());
            let conn = genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            genome.AddNode(conn);
            let peer = genome.Clone();
            let genome_nodes = genome.getNodes();
            let peer_nodes = peer.getNodes();
            genome_nodes[6].bias.value = 0.1;
            genome_nodes[6].mult.value = 1;
            peer_nodes[6].bias.value = 0.3;
            peer_nodes[6].mult.value = 3;
            let dist = genome.Distance(peer);
            expect(dist.nodes.matching).toEqual(2.2)
            expect(dist.nodes.disjoint).toEqual(0)
            expect(dist.nodes.excess).toEqual(0)
        })
    
        test('Should add 1 for each disjoint gene', () => {          
            let genome = new Genome(Config());
            let conn = genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            genome.AddNode(conn);
            let peer = genome.Clone();
            peer.AddNode(peer.getConns()[2]);
            let dist = genome.Distance(peer);
            expect(dist.nodes.matching).toEqual(0)
            expect(dist.nodes.disjoint).toEqual(1)
            expect(dist.nodes.excess).toEqual(0)
        })
    
        test('Should add 1 for each excess gene', () => {          
            let genome = new Genome(Config());
            let conn = genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            genome.AddNode(conn);
            genome.AddNode(genome.getConns()[2]);
            genome.AddNode(genome.getConns()[4]);
            let peer = genome.Clone();
            peer.RemoveNode(peer.getNodes()[7]);
            let dist = genome.Distance(peer);
            expect(dist.nodes.matching).toEqual(0)
            expect(dist.nodes.disjoint).toEqual(0)
            expect(dist.nodes.excess).toEqual(1)
        })
        
    })

    describe('Connections', () => {

        test('Should be 0 for clones', () => {
            let genome = new Genome(Config());
            let clone = genome.Clone();
            let dist = genome.Distance(clone);
            expect(dist.conns.matching).toEqual(0)
            expect(dist.conns.disjoint).toEqual(0)
            expect(dist.conns.excess).toEqual(0)
        })

        test('Should calculate matching distance from genes distances', () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            let peer = genome.Clone();
            let genome_conns = genome.getConns();
            let peer_conns = peer.getConns();
            genome_conns[0].weight.value = 0.1;
            genome_conns[0].enabled.value = true;
            peer_conns[0].weight.value = 1;
            peer_conns[0].enabled.value = false;
            let dist = genome.Distance(peer);
            expect(dist.conns.matching).toEqual(1.9)
            expect(dist.conns.disjoint).toEqual(0)
            expect(dist.conns.excess).toEqual(0)
        })
    
        test('Should add 1 for each disjoint gene', () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            let peer = genome.Clone();
            peer.AddConnection(peer.getNodes()[1],peer.getNodes()[4]);
            let dist = genome.Distance(peer);
            expect(dist.conns.matching).toEqual(0)
            expect(dist.conns.disjoint).toEqual(1)
            expect(dist.conns.excess).toEqual(0)
        })
    
        test('Should add 1 for each excess gene', () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            genome.AddConnection(genome.getNodes()[1],genome.getNodes()[4]);
            genome.AddConnection(genome.getNodes()[2],genome.getNodes()[5]);
            let peer = genome.Clone();
            peer.RemoveConnection(peer.getConns()[1]);
            let dist = genome.Distance(peer);
            expect(dist.conns.matching).toEqual(0)
            expect(dist.conns.disjoint).toEqual(0)
            expect(dist.conns.excess).toEqual(1)
        })

    })

    
})

describe ('Random Genes', () => {

    test.skip('RandomNodePair: Should select a valid random node pair', () => {
        
    })

    test.skip('RandomEnabledConnection: Should select a random enabled connection', () => {

    })

})

describe('Mutations', () => {

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
            expect(connections[0].enabled.value).toBe(true);
            expect(connections[0].id).toBe(ConnInnovation.Last());
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
            conn.enabled.value = false;
            expect(() => {
                genome.AddNode(conn);
            }).toThrowError('E_GENOME: Can\'t add a node to a disabled connection');
        });
    
        test('Should disable old connection', async () => {
            let genome = new Genome(Config());
            genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
            genome.AddNode(genome.getConns()[0]);
            
            expect(genome.getConns()[0].enabled.value).toBe(false);
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
            expect(genome.getConns()[1].in_node).toBe(0);
            expect(genome.getConns()[1].out_node).toBe(6);
            expect(genome.getConns()[1].enabled.value).toBe(true);
            expect(genome.getConns()[2]).toBeDefined();
            expect(genome.getConns()[2].in_node).toBe(6);
            expect(genome.getConns()[2].out_node).toBe(3);
            expect(genome.getConns()[2].enabled.value).toBe(true);
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

describe('Mutate', () => {

    describe('Topology', () => {

        describe('Single Mutation', () => {

            test.skip('Should call a single mutation method', () => {
            })

            test.skip('Should call mutations according to probability', () => {
            })
            
        })

        describe('Multiple Mutations', () => {

            test.skip('Should call mutations according to probability', () => {
            })
            
        })

    })

    describe('Attributes', () => {

        test.skip('Should mutate all node genes', () => {
        })

        test.skip('Should mutate all connection genes', () => {
        })

    })

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
            expect(clone_node.actv).toBe(genome_node.actv);
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
            if (clone_conn.weight) expect(clone_conn.weight).not.toBe(genome_conn.out_node);
        }
    });

    test('Clone connections should be equal to original connections', async () => {
        let genome = new Genome(Config());
        genome.AddConnection(genome.getNodes()[0],genome.getNodes()[3]);
        genome.AddConnection(genome.getNodes()[1],genome.getNodes()[4]);
        genome.AddConnection(genome.getNodes()[2],genome.getNodes()[5]);
        let clone = genome.Clone();
        for (let i = 0; i < genome.getConns().length; i++) {
            let genome_conn = genome.getConns()[i];
            let clone_conn = clone.getConns()[i];
            expect(genome_conn.in_node).toEqual(clone_conn.in_node);
            expect(genome_conn.out_node).toEqual(clone_conn.out_node);
            expect(genome_conn.enabled.value).toEqual(clone_conn.enabled.value);
            expect(genome_conn.weight.value).toEqual(clone_conn.weight.value);
            expect(genome_conn.id).toEqual(clone_conn.id);
        }
    });

});

describe('Crossover', () => {

    test.skip('?', async () => {
        
    });

    // ... neat crossover stuff (innovation, etc)

});