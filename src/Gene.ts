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
    
}

export class ConnectionGene {

    innovation: number
    enabled: boolean
    weight: Attribute

    constructor(
        public in_node: NodeGene,
        public out_node: NodeGene,
        protected config: IGenomeConfig
    ) {
        this.innovation = Innovation.New(in_node.id, out_node.id);
        this.enabled = true
        this.weight = new Attribute(config.weight)
    }

    Mutate() {
        this.weight.Mutate();
    }

    Clone(target: Genome) {
        let clone = new ConnectionGene(
            (target as any).nodes[this.in_node.id],
            (target as any).nodes[this.out_node.id],
            this.config)
        clone.innovation = this.innovation;
        clone.enabled = this.enabled;
        clone.weight = this.weight.Clone();
        return clone;
    }
    
}