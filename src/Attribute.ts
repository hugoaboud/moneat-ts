import { Gaussian } from "./util/Random";
export interface INumericAttributeConfig {
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
export class NumericAttribute {
    
    value: number

    constructor(
        private config: INumericAttributeConfig
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
        let clone = new NumericAttribute(this.config);
        clone.value = this.value;
        return clone;
    }

}


export interface IBooleanAttributeConfig {
    init: boolean,
    mutation: {
        prob: number
    }
}

export class BooleanAttribute {
    
    value: boolean

    constructor(
        private config: IBooleanAttributeConfig
    ) {
        this.value = config.init;
    }

    Mutate() {
        let r = Math.random();
        if (r < this.config.mutation.prob) {
            this.value = !this.value;
        }
    }

    Clone() {
        let clone = new BooleanAttribute(this.config);
        clone.value = this.value;
        return clone;
    }

}