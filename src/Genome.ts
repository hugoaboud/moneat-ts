import { ActivationFunction, RandomActivation } from "./Activation";
import { Attribute, IAttributeConfig } from "./Attribute";
import { ConnectionGene, NodeGene } from "./Gene";
import { Innovation } from "./Innovation";
import { Aggregation } from "./MONEAT";
import { Exception } from "./util/Exception";
import Log, { LogLevel } from "./util/Log";
import { StringID } from "./util/Random";

/**
 * Genome Configuration
 */



export interface IGenomeConfig {

    inputs: number
    outputs: number

    bias: IAttributeConfig
    weight: IAttributeConfig
    mult: IAttributeConfig

    activation: {
        hidden: ActivationFunction[]
        output: ActivationFunction[]
    }

    mutation: {
        single: boolean
        add_node: number
        remove_node: number
        add_connection: number
        remove_connection: number
    }

    aggregation: {
        default: Aggregation
        mutation: {
            prob: number
            options: Aggregation[]
        }
    }
    
    recurrent: boolean

}
export function GenomeConfig(config: IGenomeConfig) {return config;}

/**
 * Gene Matching
 */

export interface Match {
    matching: ConnectionGene[][]
    disjoint: ConnectionGene[]
    excess: ConnectionGene[]
    larger: number
}

/**
 * Genome
 * Encodes the Network to be created through node
 * and connection genes.
 */

export class Genome {

    private id: string

    private nodes: Record<number,NodeGene> = {}
    private conns: ConnectionGene[] = []

    constructor(
        protected config: IGenomeConfig
    ) {
        if (config.inputs <= 0) throw GenomeException.ZeroInputNodes();
        if (config.outputs <= 0) throw GenomeException.ZeroOutputNodes();
        if (config.activation.hidden.length == 0) throw GenomeException.EmptyHiddenActivations();
        if (config.activation.output.length == 0) throw GenomeException.EmptyOutputActivations();

        this.id = StringID();
        Log.Method(this, 'new', `(ins:${config.inputs},outs:${config.outputs})`, LogLevel.DEBUG);

        for (let i = 0; i < config.inputs; i++) {
            let id = Object.values(this.nodes).length;
            this.nodes[id] = new NodeGene(id, 'input', config);
        }

        for (let i = 0; i < config.outputs; i++) {
            let id = Object.values(this.nodes).length;
            this.nodes[id] = new NodeGene(id, 'output', config);
        }
    }

    /* Historical Gene Matching */

    

    MatchGenes(peer: Genome): Match {
        let matching = [] as ConnectionGene[][];
        let disjoint = [] as ConnectionGene[];
        let excess = [] as ConnectionGene[];
        let conns = {
            a: this.conns,
            b: peer.getConns()
        }
        
        let ranges = Innovation.Ranges(conns.a, conns.b);
        let b_matches = [];

        for (let i = 0; i < conns.a.length; i++) {
            let ca = conns.a[i];

            // Matching
            let cb_i = conns.b.findIndex(c => c.innovation == ca.innovation);
            if (cb_i >= 0) {
                let cb = conns.b[cb_i];
                b_matches.push(cb_i);
                if (!ca.enabled && !cb.enabled) continue;
                let m = [ca,cb];
                matching.push(m);
                continue;
            }

            // Disjoint / Excess
            if (!ca.enabled) continue;
            if (ca.innovation < ranges.b[0] || ca.innovation > ranges.b[1]) disjoint.push(ca);
            else excess.push(ca);
        }

        for (let i = 0; i < conns.b.length; i++) {
            let cb = conns.b[i];
            if (!cb.enabled) continue;
            if (cb.innovation < ranges.a[0] || cb.innovation > ranges.a[1]) disjoint.push(cb);
            else if (!b_matches.includes(i)) excess.push(cb);
        }

        return {
            matching,
            disjoint,
            excess,
            larger: Math.max(conns.a.length, conns.b.length)
        }
    }

    /* Random */

    RandomNodePair() {
        let nodes = this.getNodes();
        let in_nodes = Object.values(nodes).filter(n => n.type !== 'output');
        let out_nodes = Object.values(nodes).filter(n => n.type !== 'input');

        let in_node = in_nodes[Math.floor(Math.random()*in_nodes.length)];
        
        let out_node = null;
        if (this.config.recurrent) {
            out_node = out_nodes[Math.floor(Math.random()*out_nodes.length)];
        }
        else {
            while (!out_node) {
                out_node = out_nodes[Math.floor(Math.random()*out_nodes.length)];
                if (out_node == in_node) out_node = null;
            }
        }

        return [in_node, out_node]
    }

    RandomEnabledConnection() {
        let conns = this.conns.filter(c => c.enabled);
        return conns[Math.floor(Math.random() * conns.length)];
    }

    /* Mutation */

    AddConnection(in_node: NodeGene, out_node: NodeGene) {
        if (in_node.type === 'output') throw GenomeException.CantConnectFromOutput();
        if (out_node.type === 'input') throw GenomeException.CantConnectToInput();
        this.conns.map(conn => {
            if (conn.in_node == in_node && conn.out_node == out_node)
                throw GenomeException.DuplicateConnection();
        })
        let innovation = Innovation.New(in_node.id, out_node.id);
        Log.Method(this,'AddConnection',`(in:${in_node.id}, out:${out_node.id}) => conn:${innovation}`, LogLevel.DEBUG);

        this.conns.push(new ConnectionGene(in_node, out_node, this.config));
    }

    RemoveConnection(conn: ConnectionGene) {
        Log.Method(this,'RemoveConnection',`(conn:${conn.innovation})`, LogLevel.DEBUG);
        this.conns.splice(this.conns.indexOf(conn),1);
    }
    
    AddNode(conn: ConnectionGene) {
        if (!conn.enabled) throw GenomeException.CantAddToDisabledConnection();
        conn.enabled = false;
        
        let id = Object.values(this.nodes).length;
        this.nodes[id] = new NodeGene(id, 'hidden', this.config);

        let c0 = new ConnectionGene(conn.in_node, this.nodes[id], this.config);
        let c1 = new ConnectionGene(this.nodes[id], conn.out_node, this.config);
        this.conns.push(c0)
        this.conns.push(c1)

        Log.Method(this,'AddNode',`(conn:${conn.innovation}) => node:${id}, conns:(${c0.innovation},${c1.innovation})`, LogLevel.DEBUG);
    }
    
    RemoveNode(node: NodeGene) {
        Log.Method(this,'RemoveNode',`(node:${node.id})`, LogLevel.DEBUG);
        if (node.id < this.config.inputs) throw GenomeException.CantRemoveInputNode();
        if (node.id < this.config.inputs+this.config.outputs) throw GenomeException.CantRemoveOutputNode();
        delete this.nodes[node.id];
        this.conns = this.conns.filter(conn =>
            conn.in_node != node && conn.out_node != node )
    }

    Mutate() {
        Log.Method(this,'Mutate',`()`, LogLevel.DEBUG);
        // Topology
        try {
            if (this.config.mutation.single) {
                let sum = this.config.mutation.add_connection +
                          this.config.mutation.remove_connection +
                          this.config.mutation.add_node +
                          this.config.mutation.remove_node;
                let r = Math.random() * sum;
                if (r < this.config.mutation.add_connection) {
                    let pair = this.RandomNodePair();
                    this.AddConnection(pair[0], pair[1]);
                }
                else if (r < this.config.mutation.add_connection + 
                             this.config.mutation.remove_connection) {
                    this.RemoveConnection(this.conns[Math.floor(Math.random()*this.conns.length)]);
                }
                else if (r < this.config.mutation.add_connection + 
                             this.config.mutation.remove_connection +
                             this.config.mutation.add_node) {
                    this.AddNode(this.RandomEnabledConnection());
                }
                else {
                    this.RemoveNode(this.nodes[Math.floor(Math.random()*Object.values(this.nodes).length)]);
                }
            }
            else {
                if (Math.random() < this.config.mutation.add_connection) {
                    let pair = this.RandomNodePair();
                    this.AddConnection(pair[0], pair[1]);
                }
                if (Math.random() < this.config.mutation.remove_connection) {
                    this.RemoveConnection(this.conns[Math.floor(Math.random()*this.conns.length)]);
                }
                if (Math.random() < this.config.mutation.add_node) {
                    this.AddNode(this.RandomEnabledConnection());
                }
                if (Math.random() < this.config.mutation.remove_node) {
                    this.RemoveNode(this.nodes[Math.floor(Math.random()*Object.values(this.nodes).length)]);
                }
            }
        }
        catch (e) { Log.Exception(e as any, LogLevel.DEBUG) + ' (ignored)' }
        
        // Attributes
        Object.values(this.nodes).map(node => node.Mutate())
        this.conns.map(conn => conn.Mutate())
    }

    /* Crossover */
    
    Clone(): Genome {
        let clone = new Genome(this.config);
        clone.nodes = Object.values(this.nodes).reduce((a:Record<number,NodeGene>,x) => {
            a[x.id] = x.Clone()
            return a;
        }, {});
        clone.conns = this.conns.map(conn => conn.Clone(clone));
        return clone;
    }

    Crossover(peer: Genome): Genome {
        // "In composing the offspring/, genes are randomly chosen from either parent at matching genes,
        // whereas all excess or disjoint genes are always included from the more fit parent."
        // In our case, "this" is always the more fit parent.

        let clone = this.Clone();
        
        let match = this.MatchGenes(peer);    
        match.matching.map(m => {
            if (Math.random() < 0.5) return;
            let i = this.conns.indexOf(m[1]);
            let conn = m[1];
            clone.conns[i] = conn.Clone(clone);
        })

        return clone;
    }

    /* Getters */

    public getID() { return this.id }
    public getNodes() { return this.nodes }
    public getConns() { return this.conns }

    public getInputCount() { return this.config.inputs };
    public getInputs() { return Object.values(this.nodes).slice(0,this.config.inputs) };
    public getOutputCount() { return this.config.outputs };
    public getOutputs() { return Object.values(this.nodes).slice(this.config.inputs,this.config.outputs) };

}

/**
 * Genome Exceptions
 */

class GenomeException extends Exception {
    
    static code = 'E_GENOME'

    static ZeroInputNodes() {
        return new this('(config) Number of input nodes should be greater than 0', this.code);
    }
    static ZeroOutputNodes() {
        return new this('(config) Number of output nodes should be greater than 0', this.code);
    }
    static EmptyHiddenActivations() {
        return new this('(config) You should define at least one hidden activation function', this.code);
    }
    static EmptyOutputActivations() {
        return new this('(config) You should define at least one output activation function', this.code);
    }
    static CantConnectFromOutput() {
        return new this('Connection can\'t be created from an output node', this.code);
    }
    static CantConnectToInput() {
        return new this('Connection can\'t be created to an input node', this.code);
    }
    static DuplicateConnection() {
        return new this('Can\'t create duplicate connection', this.code);
    }
    static CantAddToDisabledConnection() {
        return new this('Can\'t add a node to a disabled connection', this.code);
    }
    static CantRemoveInputNode() {
        return new this('Can\'t remove an input node', this.code);
    }
    static CantRemoveOutputNode() {
        return new this('Can\'t remove an output node', this.code);
    }

}