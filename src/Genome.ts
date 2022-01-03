import { ActivationFunction, RandomActivation } from "./Activation";
import { NumericAttribute, INumericAttributeConfig, IBooleanAttributeConfig } from "./Attribute";
import { ConnectionGene, NodeGene } from "./Gene";
import { ConnInnovation, NodeInnovation } from "./Innovation";
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

    bias: INumericAttributeConfig
    weight: INumericAttributeConfig
    mult: INumericAttributeConfig
    enabled: IBooleanAttributeConfig

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
    
    feedforward: boolean

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
            let node = NodeGene.NewIO(config, i, 'input');
            this.nodes[node.id] = node;
        }
        
        for (let i = 0; i < config.outputs; i++) {
            let node = NodeGene.NewIO(config, i + config.inputs, 'output');
            this.nodes[node.id] = node;
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
        
        let ranges = ConnInnovation.Ranges(conns.a, conns.b);
        let b_matches = [];

        for (let i = 0; i < conns.a.length; i++) {
            let ca = conns.a[i];
            
            // Matching
            let cb_i = conns.b.findIndex(c => c.id == ca.id);
            if (cb_i >= 0) {
                let cb = conns.b[cb_i];
                b_matches.push(cb_i);
                //if (!ca.enabled.value && !cb.enabled.value) continue;
                let m = [ca,cb];
                matching.push(m);
                continue;
            }

            // Disjoint / Excess
            //if (!ca.enabled.value) continue;
            if (ca.id < ranges.b[0] || ca.id > ranges.b[1]) disjoint.push(ca);
            else excess.push(ca);
        }

        for (let i = 0; i < conns.b.length; i++) {
            let cb = conns.b[i];
            //if (!cb.enabled.value) continue;
            if (cb.id < ranges.a[0] || cb.id > ranges.a[1]) disjoint.push(cb);
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
        let out_node = out_nodes[Math.floor(Math.random()*out_nodes.length)];

        return [in_node, out_node]
    }

    RandomEnabledConnection() {
        let conns = this.conns.filter(c => c.enabled.value);
        return conns[Math.floor(Math.random() * conns.length)];
    }

    /* Mutation */

    isRecurrentConnection(in_node: NodeGene, out_node:NodeGene) {
        if (in_node == out_node) return true;
        let layer = [in_node];
        while (layer.length) {
            let next = [];
            for (let l = 0; l < layer.length; l++) {
                for (let c = 0; c < this.conns.length; c++) {
                    let conn = this.conns[c];
                    let out = this.nodes[conn.out_node];
                    if (conn.in_node != layer[l].id) break;
                    if (out.type == 'input') break;
                    if (out.type == 'output') break;
                    if (conn.out_node === in_node.id) return true;
                    next.push(out);
                }
            }
            layer = next;
        }
        return false;
    }

    AddConnection(in_node: NodeGene, out_node: NodeGene) {
        Log.Method(this,'AddConnection',`(in:${in_node?.id}, out:${out_node?.id})`, LogLevel.DEBUG);
        if (!in_node || !out_node) throw GenomeException.EmptyInput();
        if (in_node.type === 'output') throw GenomeException.CantConnectFromOutput();
        if (out_node.type === 'input') throw GenomeException.CantConnectToInput();
        this.conns.map(conn => {
            if (conn.in_node == in_node.id && conn.out_node == out_node.id)
            throw GenomeException.DuplicateConnection();
        })
        if (this.config.feedforward && this.isRecurrentConnection(in_node, out_node))
            throw GenomeException.RecurrentConnectionNotAllowed();

        let conn = ConnectionGene.New(this.config, in_node.id, out_node.id);
        this.conns.push(conn);
        Log.Method(this,'AddConnection',` => conn:${conn.id}`, LogLevel.DEBUG);
    }

    RemoveConnection(conn: ConnectionGene) {
        Log.Method(this,'RemoveConnection',`(conn:${conn?.id})`, LogLevel.DEBUG);
        if (!conn) throw GenomeException.EmptyInput();
        this.conns.splice(this.conns.indexOf(conn),1);
    }
    
    AddNode(conn: ConnectionGene) {
        Log.Method(this,'AddNode',`(conn:${conn?.id})`, LogLevel.DEBUG);
        if (!conn) throw GenomeException.EmptyInput();
        if (!conn.enabled.value) throw GenomeException.CantAddToDisabledConnection();
        conn.enabled.value = false;
        
        let node = NodeGene.NewHidden(this.config, conn);
        this.nodes[node.id] = node;

        let c0 = ConnectionGene.New(this.config, conn.in_node, node.id);
        let c1 = ConnectionGene.New(this.config, node.id, conn.out_node);
        this.conns.push(c0)
        this.conns.push(c1)
        Log.Method(this,'AddNode',` => node:${node.id}, conns:(${c0.id},${c1.id})`, LogLevel.DEBUG);
    }
    
    RemoveNode(node: NodeGene) {
        Log.Method(this,'RemoveNode',`(node:${node?.id})`, LogLevel.DEBUG);
        if (!node) throw GenomeException.EmptyInput();
        if (node.id < this.config.inputs) throw GenomeException.CantRemoveInputNode();
        if (node.id < this.config.inputs+this.config.outputs) throw GenomeException.CantRemoveOutputNode();
        delete this.nodes[node.id];
        this.conns = this.conns.filter(conn =>
            conn.in_node != node.id && conn.out_node != node.id )
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
                    let r = Math.floor(Math.random()*this.conns.length);
                    this.RemoveConnection(this.conns[r]);
                }
                else if (r < this.config.mutation.add_connection + 
                             this.config.mutation.remove_connection +
                             this.config.mutation.add_node) {
                    this.AddNode(this.RandomEnabledConnection());
                }
                else {
                    let n = Object.values(this.nodes).length;
                    let r = this.config.inputs + this.config.outputs;
                    r += Math.floor(Math.random()*(n-r))
                    this.RemoveNode(this.nodes[r]);
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
                    let n = Object.values(this.nodes).length;
                    let r = this.config.inputs + this.config.outputs;
                    r += Math.floor(Math.random()*(n-r))
                    this.RemoveNode(this.nodes[r]);
                }
            }
        }
        catch (e: any) { 
            if (e.code === 'E_GENOME')
                Log.Exception(e as any, LogLevel.DEBUG)
            else throw e;
        }
        
        // Attributes
        Object.values(this.nodes).map(node => node.Mutate())
        this.conns.map(conn => conn.Mutate())
    }

    /* Crossover */
    
    Clone(): Genome {
        let clone = new Genome(this.config);
        clone.nodes = Object.values(this.nodes).reduce((a:Record<number,NodeGene>,x) => {
            a[x.id] = x.Clone()
            return a;        }, {});
        clone.conns = this.conns.map(conn => conn.Clone());
        return clone;
    }

    Crossover(peer: Genome): Genome {
        Log.Method(this,'Crossover',`(peer:${peer.getID()})`, LogLevel.DEBUG);
        // "In composing the offspring/, genes are randomly chosen from either parent at matching genes,
        // whereas all excess or disjoint genes are always included from the more fit parent."
        // On our case, we assume "this" is the fittest parent.
        
        let clone = new Genome(this.config);
        
        let peer_conns = peer.conns.map(c => c.id);
        clone.conns = this.conns.map(conn => {
            let conn_i = peer_conns.indexOf(conn.id);
            if (conn_i >= 0)
                return conn.Crossover(peer.conns[conn_i]);
            else
                return conn.Clone();
        })

        Object.values(this.nodes).slice(this.config.inputs).map(node => {
            if (peer.nodes[node.id])
                clone.nodes[node.id] = node.Crossover(peer.nodes[node.id]);
            else
                clone.nodes[node.id] = node.Clone();
        })
        
        return clone;
    }

    Distance(peer: Genome) {
        let d = 0;
        Object.keys(this.nodes).map(id => {
            if (!peer.nodes[id as any]) return;
            d += this.nodes[id as any].Distance(peer.nodes[id as any])
        })
        Object.keys(this.conns).map(id => {
            if (!peer.conns[id as any]) return; 
            d += this.conns[id as any].Distance(peer.conns[id as any])
        })
        return d;
    }

    /* Getters */

    public getID() { return this.id }
    public getNodes() { return this.nodes }
    public getNodeCount() { return Object.keys(this.nodes).length }
    public getConns() { return this.conns }

    public getInputCount() { return this.config.inputs };
    public getInputs() { return Object.values(this.nodes).slice(0,this.config.inputs) };
    public getOutputCount() { return this.config.outputs };
    public getOutputs() { return Object.values(this.nodes).slice(this.config.inputs,this.config.inputs+this.config.outputs) };

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
    static EmptyInput() {
        return new this('Invalid input', this.code);
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
    static RecurrentConnectionNotAllowed() {
        return new this('Can\'t create a recurrent connection on a feed-forward genome', this.code);
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