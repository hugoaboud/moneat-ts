import { threadId } from "worker_threads";
import { ActivationFunction } from "./Activation";
import { Attribute, IAttributeConfig } from "./Attribute";
import { Genome, IGenomeConfig } from "./Genome";
import { Innovation } from "./Innovation";
import { StringID } from "./util/Random"

export class NodeGene {

    bias: Attribute
    mult: Attribute 
    actv: ActivationFunction

    constructor(
        public id: number,
        public type: 'input' | 'hidden' | 'output',
        protected config: IGenomeConfig
    ) {
        this.bias = new Attribute(config.bias)
        this.mult = new Attribute(config.mult)
        this.actv = ((config.activation as any)[type] || [])[0]
    }

    Mutate() {
        this.bias.Mutate();
        this.mult.Mutate();
    }

    Clone() {
        let clone = new NodeGene(this.id, this.type, this.config);
        clone.bias = this.bias.Clone();
        clone.mult = this.mult.Clone();
        return clone;
    }
    
    Crossover(peer: NodeGene) {
        let clone = new NodeGene(this.id, this.type, this.config);
        if (Math.random() < 0.5) clone.bias = this.bias.Clone();
        else clone.bias = peer.bias.Clone();
        if (Math.random() < 0.5) clone.mult = this.mult.Clone();
        else clone.mult = peer.mult.Clone();
        return clone;
    }
    
}

export class ConnectionGene {

    innovation: number
    enabled: boolean
    weight: Attribute

    constructor(
        public in_node: number,
        public out_node: number,
        protected config: IGenomeConfig,
        innovation?: number
    ) {
        this.innovation = innovation || Innovation.New(in_node, out_node);
        this.enabled = true
        this.weight = new Attribute(config.weight)
    }

    Mutate() {
        this.weight.Mutate();
    }

    Clone() {
        let clone = new ConnectionGene(this.in_node,this.out_node,this.config)
        clone.innovation = this.innovation;
        clone.enabled = this.enabled;
        clone.weight = this.weight.Clone();
        return clone;
    }

    Crossover(peer: ConnectionGene) {
        let clone = new ConnectionGene(this.in_node, this.out_node, this.config, this.innovation);
        if (Math.random() < 0.5) clone.weight = this.weight.Clone();
        else clone.weight = peer.weight.Clone();
        if (Math.random() < 0.5) clone.enabled = this.enabled;
        else clone.enabled = peer.enabled;
        return clone;
    }
    
}