import { threadId } from "worker_threads";
import { ActivationFunction } from "./Activation";
import { NumericAttribute, INumericAttributeConfig, BooleanAttribute } from "./Attribute";
import { Genome, IGenomeConfig } from "./Genome";
import { Innovation } from "./Innovation";
import { StringID } from "./util/Random"

export class NodeGene {

    bias!: NumericAttribute
    mult!: NumericAttribute 
    actv: ActivationFunction

    constructor(
        public id: number,
        public type: 'input' | 'hidden' | 'output',
        protected config: IGenomeConfig,
        init = true
    ) {
        if (init) {
            this.bias = new NumericAttribute(config.bias)
            this.mult = new NumericAttribute(config.mult)
        }
        this.actv = ((config.activation as any)[type] || [])[0]
    }

    Mutate() {
        this.bias.Mutate();
        this.mult.Mutate();
    }

    Clone() {
        let clone = new NodeGene(this.id, this.type, this.config, false);
        clone.bias = this.bias.Clone();
        clone.mult = this.mult.Clone();
        return clone;
    }
    
    Crossover(peer: NodeGene) {
        let clone = new NodeGene(this.id, this.type, this.config, false);
        if (Math.random() < 0.5) clone.bias = this.bias.Clone();
        else clone.bias = peer.bias.Clone();
        if (Math.random() < 0.5) clone.mult = this.mult.Clone();
        else clone.mult = peer.mult.Clone();
        return clone;
    }
    
}

export class ConnectionGene {

    innovation!: number
    enabled!: BooleanAttribute
    weight!: NumericAttribute

    constructor(
        public in_node: number,
        public out_node: number,
        protected config: IGenomeConfig,
        init = true
    ) {
        if (init) {
            this.innovation = Innovation.New(this.in_node, this.out_node);
            this.enabled = new BooleanAttribute(this.config.enabled);
            this.weight = new NumericAttribute(this.config.weight);
        }
    }

    Mutate() {
        this.enabled.Mutate();
        this.weight.Mutate();
    }

    Clone() {
        let clone = new ConnectionGene(this.in_node,this.out_node,this.config,false);
        clone.innovation = this.innovation;
        clone.enabled = this.enabled.Clone();
        clone.weight = this.weight.Clone();
        return clone;
    }

    Crossover(peer: ConnectionGene) {
        let clone = new ConnectionGene(this.in_node, this.out_node, this.config, false);
        clone.innovation = this.innovation;
        if (Math.random() < 0.5) clone.weight = this.weight.Clone();
        else clone.weight = peer.weight.Clone();
        if (Math.random() < 0.5) clone.enabled = this.enabled.Clone();
        else clone.enabled = peer.enabled.Clone();
        return clone;
    }
    
}