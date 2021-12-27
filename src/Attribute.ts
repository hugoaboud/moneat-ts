import { Gaussian } from "./util/Random";

export interface IAttributeConfig {
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

/**
 * Mutable Parameter (bias, weight and mult)
 */

 export class Attribute {
    
    value: number

    constructor(
        private config: IAttributeConfig
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
        let clone = new Attribute(this.config);
        clone.value = this.value;
        return clone;
    }

}