import { Activation, ActivationFunction, RandomActivation } from "./Activation";
import { Colored } from "./cli/string";
import { Exception } from "./util/Exception";
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
    type: 'input' | 'hidden' | 'output'
    activation: ActivationFunction
    bias: MutableParam
    mult: MutableParam
    value: number
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
    private connections: ConnectionGene[] = []

    constructor(
        protected config: IGenomeConfig,
        inputs: number,
        outputs: number
    ) {
        if (inputs <= 0) throw GenomeException.ZeroInputNodes();
        if (outputs <= 0) throw GenomeException.ZeroOutputNodes();

        this.id = StringID();

        for (let i = 0; i < inputs; i++) {
            this.nodes.push({
                type:'input',
                activation: null as any,
                bias: null as any,
                mult: null as any,
                value: 0
            })
        }

        for (let i = 0; i < outputs; i++) {
            this.nodes.push({
                type:'output',
                activation: RandomActivation(config.activation.output),
                bias: new MutableParam(config.bias),
                mult: new MutableParam(config.mult),
                value: 0
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
            enabled: true,
            weight: new MutableParam(this.config.weight),  
            innovation: Innovation.new
        })
    }
    
    MutateAddNode(conn: ConnectionGene) {

        conn.enabled = false;

        this.nodes.push({
            type: 'hidden',
            activation: RandomActivation(this.config.activation.hidden),
            bias: new MutableParam(this.config.bias),
            mult: new MutableParam(this.config.mult),
            value: 0
        })

        this.connections.push({
            in_node: conn.in_node,
            out_node: this.nodes[this.nodes.length-1],
            enabled: true,
            weight: new MutableParam(this.config.weight),  
            innovation: Innovation.new
        })
        this.connections.push({
            in_node: this.nodes[this.nodes.length-1],
            out_node: conn.out_node,
            enabled: true,
            weight: new MutableParam(this.config.weight),  
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
        // posing the offspring/, genes are randomly chosen from either parent at matching genes,
        // whereas all excess or disjoint genes are always included from the more fit parent.
    }

    /* Print to console */

    public Print() {

        console.log(Colored('Genome ', 'lightcyan') + Colored(this.id, 'lightblue'));
        
        console.log(Colored('- nodes:', 'lightgray'));
        this.nodes.map((node,i) => {
            let color = {
                input: 'blue',
                hidden: 'green',
                output: 'purple'
            }[node.type];
            console.log(
                Colored(`\t${(i+'  ').slice(0,3)} `, color) +
                Colored(`${(node.type + ' ').slice(0,6)} `, color) +
                (node.activation?.name || ''+'        ').slice(0,19) + ' ' +
                (node.bias?((Colored('b:','darkgray') + node.bias.value.toFixed(3)+'      ').slice(0,19)):'        ') + ' ' +
                (node.mult?((Colored('m:','darkgray') + node.mult.value.toFixed(3)+'      ').slice(0,19)):'        ') + ' ' +
                Colored('v:','darkgray') + node.value.toFixed(3)
            )
        })
        
        console.log(Colored('- connections:', 'lightgray'));
        this.connections.map((conn,i) => {
            let color_in = {
                input: 'blue',
                hidden: 'green',
                output: 'purple'
            }[conn.in_node.type];
            let color_out = {
                input: 'blue',
                hidden: 'green',
                output: 'purple'
            }[conn.out_node.type];
            let color = null as any;
            if (!conn.enabled) {
                color = 'darkgray';
            }
            let i_in = this.nodes.indexOf(conn.in_node);
            let i_out = this.nodes.indexOf(conn.out_node);
            console.log(
                Colored(`\t${(conn.innovation+'   ').slice(0,4)} `, color || 'lightblue') +
                Colored(`${(i_in+'  ').slice(0,3)} `, color || color_in) +
                Colored(' -> ', color) +
                Colored(`${(i_out+'  ').slice(0,3)} `, color || color_out) + 
                Colored('w:','darkgray') + Colored(conn.weight.value.toFixed(3), color)
            )
        })

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