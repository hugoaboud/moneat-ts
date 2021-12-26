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

    private nodes: NodeGene[] = []
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
            this.nodes.push({
                id: this.nodes.length,
                type:'input',
                activation: null as any,
                bias: null as any,
                mult: null as any
            })
        }

        for (let i = 0; i < config.outputs; i++) {
            this.nodes.push({
                id: this.nodes.length,
                type:'output',
                activation: RandomActivation(config.activation.output),
                bias: new MutableParam(config.bias),
                mult: new MutableParam(config.mult)
            })
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
                let m = (ca.enabled?[ca]:[]).concat(cb.enabled?[cb]:[]);
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
        let in_nodes = nodes.filter(n => n.type !== 'output');
        let out_nodes = nodes.filter(n => n.type !== 'input');

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
        Log.Method(this,'AddNode',`(conn:${conn.innovation}) => node:${this.nodes.length}, conns:(${innovation_a},${innovation_b})`, LogLevel.DEBUG);

        conn.enabled = false;

        this.nodes.push({
            id: this.nodes.length,
            type: 'hidden',
            activation: RandomActivation(this.config.activation.hidden),
            bias: new MutableParam(this.config.bias),
            mult: new MutableParam(this.config.mult)
        })

        this.conns.push({
            in_node: conn.in_node,
            out_node: this.nodes[this.nodes.length-1],
            enabled: true,
            weight: new MutableParam(this.config.weight),  
            innovation: innovation_a
        })
        this.conns.push({
            in_node: this.nodes[this.nodes.length-1],
            out_node: conn.out_node,
            enabled: true,
            weight: new MutableParam(this.config.weight),  
            innovation: innovation_b
        })

    }
    
    RemoveNode(node: NodeGene) {
        Log.Method(this,'RemoveNode',`(node:${node.id})`, LogLevel.DEBUG);
        let n = this.nodes.indexOf(node);
        if (n < this.config.inputs) throw GenomeException.CantRemoveInputNode();
        if (n < this.config.inputs+this.config.outputs) throw GenomeException.CantRemoveOutputNode();

        this.nodes.slice(n).map(node => node.id--);
        this.nodes.splice(n,1);
        this.conns = this.conns.filter(conn =>
            conn.in_node != node && conn.out_node != node )
    }

    Mutate() {
        Log.Method(this,'Mutate',`()`, LogLevel.DEBUG);
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
                this.RemoveNode(this.nodes[Math.floor(Math.random()*this.nodes.length)]);
            }
        }
        catch (e) { Log.Exception(e as any, LogLevel.DEBUG) + ' (ignored)' }
    }

    /* Crossover */
    
    Clone(): Genome {
        let clone = new Genome(this.config);
        clone.nodes = this.nodes.map((node,id) => ({
            id,
            type: node.type,
            activation: node.activation,
            bias: node.bias?.Clone(),
            mult: node.mult?.Clone()
        }));
        clone.conns = this.conns.map((conn,id) => ({
            in_node: clone.nodes[this.nodes.indexOf(conn.in_node)],
            out_node: clone.nodes[this.nodes.indexOf(conn.out_node)],
            enabled: conn.enabled,
            weight: conn.weight.Clone(),
            innovation: conn.innovation
        }));
        return clone;
    }

    Crossover(peer: Genome): Genome {
        // When crossing over, the
        // genes in both genomes with the same innovation numbers are lined up. These genes
        // are called matching genes. Genes that do not match are either disjoint or excess, depend-
        // ing on whether they occur within or outside the range of the other parent’s innovation
        // numbers. They represent structure that is not present in the other genome.  In com-
        // posing the offspring/, genes are randomly chosen from either parent at matching genes,
        // whereas all excess or disjoint genes are always included from the more fit parent.
        return this.Clone();
    }

    /* Getters */

    public getID() { return this.id }
    public getNodes() { return this.nodes }
    public getConns() { return this.conns }

    public getInputCount() { return this.config.inputs };
    public getInputs() { return this.nodes.filter(node => node.type === 'input') };
    public getOutputCount() { return this.config.outputs };
    public getOutputs() { return this.nodes.filter(node => node.type === 'output') };

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