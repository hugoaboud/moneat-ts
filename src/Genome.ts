import { Activation, ActivationFunction, RandomActivation } from "./Activation";
import { Colored } from "./cli/string";
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

    bias: IMutableParamConfig
    weight: IMutableParamConfig
    mult: IMutableParamConfig

    activation: {
        hidden: ActivationFunction[]
        output: ActivationFunction[]
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
        protected config: IGenomeConfig,
        protected inputs: number,
        protected outputs: number
    ) {
        if (inputs <= 0) throw GenomeException.ZeroInputNodes();
        if (outputs <= 0) throw GenomeException.ZeroOutputNodes();

        this.id = StringID();
        Log.Method(this, `new(ins:${inputs},outs:${outputs})`, LogLevel.INFO);

        for (let i = 0; i < inputs; i++) {
            this.nodes.push({
                id: this.nodes.length,
                type:'input',
                activation: null as any,
                bias: null as any,
                mult: null as any
            })
        }

        for (let i = 0; i < outputs; i++) {
            this.nodes.push({
                id: this.nodes.length,
                type:'output',
                activation: RandomActivation(config.activation.output),
                bias: new MutableParam(config.bias),
                mult: new MutableParam(config.mult)
            })
        }
    }

    /* Mutation */

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

    MutateAddConnection(in_node: NodeGene, out_node: NodeGene) {
        if (in_node.type === 'output') throw GenomeException.CantConnectFromOutput();
        if (out_node.type === 'input') throw GenomeException.CantConnectToInput();
        this.conns.map(conn => {
            if (conn.in_node == in_node && conn.out_node == out_node)
            throw GenomeException.DuplicateConnection();
        })
        let innovation = Innovation.new;
        Log.Method(this, `MutateAddConnection(in:${in_node.id}, out:${out_node.id}) => conn:${innovation}`, LogLevel.INFO);

        this.conns.push({ 
            in_node: in_node,
            out_node: out_node,
            enabled: true,
            weight: new MutableParam(this.config.weight),  
            innovation
        })
    }
    
    MutateAddNode(conn: ConnectionGene) {
        if (!conn.enabled) throw GenomeException.CantAddToDisabledConnection();
        
        let innovation_a = Innovation.new;
        let innovation_b = Innovation.new;
        Log.Method(this, `MutateAddNode(conn:${conn.innovation}) => node:${this.nodes.length}, conns:(${innovation_a},${innovation_b})`, LogLevel.INFO);

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

    Mutate() {

    }

    /* Crossover */
    
    Crossover(peer: Genome) {
        // When crossing over, the
        // genes in both genomes with the same innovation numbers are lined up. These genes
        // are called matching genes. Genes that do not match are either disjoint or excess, depend-
        // ing on whether they occur within or outside the range of the other parent’s innovation
        // numbers. They represent structure that is not present in the other genome.  In com-
        // posing the offspring/, genes are randomly chosen from either parent at matching genes,
        // whereas all excess or disjoint genes are always included from the more fit parent.
    }

    /* Getters */

    public getID() { return this.id }
    public getNodes() { return this.nodes }
    public getConns() { return this.conns }

    public getInputCount() { return this.inputs };
    public getInputs() { return this.nodes.filter(node => node.type === 'input') };
    public getOutputCount() { return this.outputs };
    public getOutputs() { return this.nodes.filter(node => node.type === 'output') };

}

/**
 * Genome Exceptions
 */

class GenomeException extends Exception {
    
    static code = 'E_GENOME'

    static ZeroInputNodes() {
        return new this('Number of input nodes should be greater than 0', this.code);
    }
    static ZeroOutputNodes() {
        return new this('Number of output nodes should be greater than 0', this.code);
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

}