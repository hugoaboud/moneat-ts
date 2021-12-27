import { ActivationFunction, RandomActivation } from "./Activation";
import { Aggregation } from "./MONEAT";
import { Exception } from "./util/Exception";
import Log, { LogLevel } from "./util/Log";
import { Gaussian, StringID } from "./util/Random";

/**
 * Genome Configuration
 */

 export interface IMutableParamConfig {
    min: number
    max: number
    init: {
        mean: number
        stdev: number
    }
    mutation: {
        rate: number
        prob: {
            offset: number,
            replace: number
        }
    }
}

export interface IGenomeConfig {

    inputs: number
    outputs: number

    bias: IMutableParamConfig
    weight: IMutableParamConfig
    mult: IMutableParamConfig

    activation: {
        hidden: ActivationFunction[]
        output: ActivationFunction[]
    }

    mutation: {
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
 * Global Innovation Number
 * Used to track innovations through evolution,
 * which allows for efficient crossover of genomes.
 */
export class Innovation {
    private static _last = 0;
    static get new() { return ++this._last; }
    static get last() { return this._last; }
}
export interface Match {
    matching: ConnectionGene[][]
    disjoint: ConnectionGene[]
    excess: ConnectionGene[]
    larger: number
}

/**
 * Mutable Parameter (bias, weight and mult)
 */

export class MutableParam {
    
    value: number

    constructor(
        private config: IMutableParamConfig
    ) {
        this.value = Gaussian(config.init.mean, config.init.stdev)();
        if (this.value < config.min) this.value = config.min;
        if (this.value > config.max) this.value = config.max;
    }

    Mutate() {
        let r = Math.random();
        if (r < this.config.mutation.prob.replace) {
            this.value = Gaussian(this.config.init.mean, this.config.init.stdev)();
            return;
        }
        else if (r < this.config.mutation.prob.offset) {
            this.value += (Math.random()*2-1)*this.config.mutation.rate;
        }
    }

    Clone() {
        let clone = new MutableParam(this.config);
        clone.value = this.value;
        return clone;
    }

}

/**
 * Gene Interfaces
 */

export interface NodeGene {
    id: number
    type: 'input' | 'hidden' | 'output'
    activation: ActivationFunction
    bias: MutableParam
    mult: MutableParam
}

export interface ConnectionGene {
    in_node: NodeGene
    out_node: NodeGene
    enabled: boolean
    weight: MutableParam
    innovation: number
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
            this.nodes[id] = {
                id,
                type:'input',
                activation: null as any,
                bias: null as any,
                mult: null as any
            }
        }

        for (let i = 0; i < config.outputs; i++) {
            let id = Object.values(this.nodes).length;
            this.nodes[id] = {
                id,
                type:'output',
                activation: RandomActivation(config.activation.output),
                bias: new MutableParam(config.bias),
                mult: new MutableParam(config.mult)
            }
        }
    }

    /* Historical Gene Matching */

    static InnovationRanges(a: ConnectionGene[], b: ConnectionGene[]): {a:[number,number], b:[number,number]}{
        let a_range = [Infinity,-Infinity] as [number,number];
        for (let i = 0; i < a.length; i++) {
            let inn = a[i].innovation;
            if (inn < a_range[0]) a_range[0] = inn;
            if (inn > a_range[1]) a_range[1] = inn;
        }
        let b_range = [Infinity,-Infinity] as [number,number];
        for (let i = 0; i < b.length; i++) {
            let inn = b[i].innovation;
            if (inn < b_range[0]) b_range[0] = inn;
            if (inn > b_range[1]) b_range[1] = inn;
        }
        return {
            a: a_range,
            b: b_range
        }
    }

    MatchGenes(peer: Genome): Match {
        let matching = [] as ConnectionGene[][];
        let disjoint = [] as ConnectionGene[];
        let excess = [] as ConnectionGene[];
        let conns = {
            a: this.conns,
            b: peer.getConns()
        }
        
        let ranges = Genome.InnovationRanges(conns.a, conns.b);
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
        let innovation = Innovation.new;
        Log.Method(this,'AddConnection',`(in:${in_node.id}, out:${out_node.id}) => conn:${innovation}`, LogLevel.DEBUG);

        this.conns.push({ 
            in_node: in_node,
            out_node: out_node,
            enabled: true,
            weight: new MutableParam(this.config.weight),  
            innovation
        })
    }

    RemoveConnection(conn: ConnectionGene) {
        Log.Method(this,'RemoveConnection',`(conn:${conn.innovation})`, LogLevel.DEBUG);
        this.conns.splice(this.conns.indexOf(conn),1);
    }
    
    AddNode(conn: ConnectionGene) {
        if (!conn.enabled) throw GenomeException.CantAddToDisabledConnection();
        
        let innovation_a = Innovation.new;
        let innovation_b = Innovation.new
        let id = Object.values(this.nodes).length;
        Log.Method(this,'AddNode',`(conn:${conn.innovation}) => node:${id}, conns:(${innovation_a},${innovation_b})`, LogLevel.DEBUG);

        conn.enabled = false;

        this.nodes[id] = {
            id,
            type: 'hidden',
            activation: RandomActivation(this.config.activation.hidden),
            bias: new MutableParam(this.config.bias),
            mult: new MutableParam(this.config.mult)
        }

        this.conns.push({
            in_node: conn.in_node,
            out_node: this.nodes[id],
            enabled: true,
            weight: new MutableParam(this.config.weight),  
            innovation: innovation_a
        })
        this.conns.push({
            in_node: this.nodes[id],
            out_node: conn.out_node,
            enabled: true,
            weight: new MutableParam(this.config.weight),  
            innovation: innovation_b
        })

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
            if (Math.random() < this.config.mutation.add_connection) {
                let pair = this.RandomNodePair();
                this.AddConnection(pair[0], pair[1]);
            }
            else if (Math.random() < this.config.mutation.remove_connection) {
                this.RemoveConnection(this.conns[Math.floor(Math.random()*this.conns.length)]);
            }
            else if (Math.random() < this.config.mutation.add_node) {
                this.AddNode(this.RandomEnabledConnection());
            }
            else if (Math.random() < this.config.mutation.remove_node) {
                this.RemoveNode(this.nodes[Math.floor(Math.random()*Object.values(this.nodes).length)]);
            }
        }
        catch (e) { Log.Exception(e as any, LogLevel.DEBUG) + ' (ignored)' }
        
        // Mutable Params
        Object.values(this.nodes).map(node => {
            node.bias?.Mutate();
            node.mult?.Mutate();
        })
        this.conns.map(conn => {
            conn.weight.Mutate();
        })
    }

    /* Crossover */
    
    Clone(): Genome {
        let clone = new Genome(this.config);
        clone.nodes = Object.values(this.nodes).reduce((a:Record<number,NodeGene>,x) => {
            a[x.id] = {
                id: x.id,
                type: x.type,
                activation: x.activation,
                bias: x.bias?.Clone(),
                mult: x.mult?.Clone()
            }
            return a;
        }, {});
        clone.conns = this.conns.map(conn => ({
            in_node: clone.nodes[conn.in_node.id],
            out_node: clone.nodes[conn.out_node.id],
            enabled: conn.enabled,
            weight: conn.weight.Clone(),
            innovation: conn.innovation
        }));
        return clone;
    }

    Crossover(peer: Genome): Genome {
        // "In composing the offspring/, genes are randomly chosen from either parent at matching genes,
        // whereas all excess or disjoint genes are always included from the more fit parent."
        // In our case, "this" is always the more fit parent.

        let clone = this.Clone();
        
        let match = this.MatchGenes(peer);    
        match.matching.map(m => {
            let i = this.conns.indexOf(m[0]);
            let conn = m[Math.floor(Math.random()*2)];
            clone.conns[i] = {
                in_node: clone.nodes[conn.in_node.id],
                out_node: clone.nodes[conn.out_node.id],
                enabled: conn.enabled,
                weight: conn.weight.Clone(),
                innovation: conn.innovation
            }
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