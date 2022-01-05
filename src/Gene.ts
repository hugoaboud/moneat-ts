import { ActivationFunction } from "./Activation";
import { NumericAttribute, BooleanAttribute } from "./Attribute";
import { IGenomeConfig } from "./Genome";
import { ConnInnovation, NodeInnovation } from "./Innovation";

export class NodeGene {

    bias: NumericAttribute
    mult: NumericAttribute
    actv: ActivationFunction

    constructor(
        protected config: IGenomeConfig,
        public id: number,
        public type: 'input' | 'hidden' | 'output',
        bias?: NumericAttribute, 
        mult?: NumericAttribute 
    ) {
        if (bias) this.bias = bias.Clone();
        else this.bias = new NumericAttribute(config.bias);
        if (mult) this.mult = mult.Clone();
        else this.mult = new NumericAttribute(config.mult);
        this.actv = ((config.activation as any)[type] || [])[0]
    }

    Mutate() {
        this.bias.Mutate();
        this.mult.Mutate();
    }

    Clone() {
        return new NodeGene(this.config, this.id, this.type, this.bias, this.mult);
    }
    
    Crossover(peer: NodeGene) {
        let bias = this.bias;
        if (Math.random() < 0.5) bias = peer.bias;
        let mult = this.mult;
        if (Math.random() < 0.5) mult = peer.mult;
        return new NodeGene(this.config, this.id, this.type, bias, mult);
    }

    Distance(peer: NodeGene) {
        let d = Math.abs(this.bias.value - peer.bias.value) + Math.abs(this.mult.value - peer.mult.value)
        if (this.actv != peer.actv) d += 1.0;
        return d;
    }

    static NewIO(config: IGenomeConfig, id: number, type: 'input'|'output') {
        id = NodeInnovation.New(id, id);
        return new NodeGene(config, id, type);
    }

    static NewHidden(config: IGenomeConfig, conn: ConnectionGene) {
        let id = NodeInnovation.New(conn.in_node, conn.out_node);
        return new NodeGene(config, id, 'hidden');
    }
    
}

export class ConnectionGene {

    enabled: BooleanAttribute
    weight: NumericAttribute

    constructor(
        protected config: IGenomeConfig,
        public id: number,
        public in_node: number,
        public out_node: number,
        enabled?: BooleanAttribute,
        weight?: NumericAttribute
    ) {
        if (enabled) this.enabled = enabled.Clone();
        else this.enabled = new BooleanAttribute(config.enabled);
        if (weight) this.weight = weight.Clone();
        else this.weight = new NumericAttribute(config.weight);
    }

    Mutate() {
        this.enabled.Mutate();
        this.weight.Mutate();
    }

    Clone() {
        return new ConnectionGene(this.config,this.id,this.in_node,this.out_node,this.enabled,this.weight);
    }

    Crossover(peer: ConnectionGene) {
        let enabled = this.enabled;
        if (Math.random() < 0.5) enabled = peer.enabled;
        let weight = this.weight;
        if (Math.random() < 0.5) weight = peer.weight;
        return new ConnectionGene(this.config, this.id, this.in_node, this.out_node, enabled, weight);
    }

    Distance(peer: ConnectionGene) {
        let d = Math.abs(this.weight.value - peer.weight.value)
        if (this.enabled.value != peer.enabled.value) d += 1.0;
        return d;
    }

    static New(config: IGenomeConfig, in_node: number, out_node: number) {
        let id = ConnInnovation.New(in_node, out_node);
        return new ConnectionGene(config, id, in_node, out_node);
    }
    
}