import { Activation, ActivationFunction, RandomActivation } from "./Activation";
import { Exception } from "./util/Exception";
import { Gaussian } from "./util/Random";

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
    type: 'input' | 'hidden' | 'output'
    activation: ActivationFunction
    bias: MutableParam
    mult: MutableParam
}

export interface ConnectionGene {
    in_node: NodeGene
    out_node: NodeGene
    weight: MutableParam
    enabled: boolean
    innovation: number
}

/**
 * Genome
 * Encodes the Network to be created through node
 * and connection genes.
 */

export class Genome {

    private nodes: NodeGene[] = []
    private connections: ConnectionGene[] = []

    constructor(
        protected config: IGenomeConfig,
        inputs: number,
        outputs: number
    ) {
        if (inputs <= 0) throw GenomeException.ZeroInputNodes();
        if (outputs <= 0) throw GenomeException.ZeroOutputNodes();

        for (let i = 0; i < inputs; i++) {
            this.nodes.push({
                type:'input',
                activation: null as any,
                bias: null as any,
                mult: null as any
            })
        }

        for (let i = 0; i < outputs; i++) {
            this.nodes.push({
                type:'output',
                activation: RandomActivation(config.activation.output),
                bias: new MutableParam(config.bias),
                mult: new MutableParam(config.mult)
            })
        }
    }

    /* Mutation */

    Mutate() {

    }

    MutateAddConnection(in_node: NodeGene, out_node: NodeGene) {
        if (in_node.type === 'output') throw GenomeException.CantConnectFromOutput();
        if (out_node.type === 'input') throw GenomeException.CantConnectToInput();

        this.connections.map(conn => {
            if (conn.in_node == in_node && conn.out_node == out_node)
                throw GenomeException.DuplicateConnection();
        })

        this.connections.push({ 
            in_node: in_node,
            out_node: out_node,
            weight: new MutableParam(this.config.weight),  
            enabled: true,
            innovation: Innovation.new
        })
    }
    
    MutateAddNode(conn: ConnectionGene) {

        conn.enabled = false;

        this.nodes.push({
            type: 'hidden',
            activation: RandomActivation(this.config.activation.hidden),
            bias: new MutableParam(this.config.bias),
            mult: new MutableParam(this.config.mult)
        })

        this.connections.push({
            in_node: conn.in_node,
            out_node: this.nodes[this.nodes.length-1],
            weight: new MutableParam(this.config.weight),  
            enabled: true,
            innovation: Innovation.new
        })
        this.connections.push({
            in_node: this.nodes[this.nodes.length-1],
            out_node: conn.out_node,
            weight: new MutableParam(this.config.weight),  
            enabled: true,
            innovation: Innovation.new
        })

    }   

    /* Crossover */
    
    Crossover(peer: Genome) {
        // When crossing over, the
        // genes in both genomes with the same innovation numbers are lined up. These genes
        // are called matching genes. Genes that do not match are either disjoint or excess, depend-
        // ing on whether they occur within or outside the range of the other parent’s innovation
        // numbers. They represent structure that is not present in the other genome.  In com-
        // posing the offspring, genes are randomly chosen from either parent at matching genes,
        // whereas all excess or disjoint genes are always included from the more fit parent.
    }

    /* Getters */

    public get nodeGenes() {return this.nodes}
    public get connectionGenes() {return this.connections}

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

}