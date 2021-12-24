import { Exception } from "./util/Exception";

export type ActivationFunction = (v: number) => number
export function RandomActivation(options: ActivationFunction[]) {
    if (!options.length) throw ActivationException.NoRandomOptions();
    return options[Math.floor(Math.random()*options.length)];
}

export const Activation = {
    
    Linear(v: number) {
        return v;
    },
    
    Clamped(v: number) {
        if (v < -1) return -1;
        if (v > 1) return 1;
        return v;
    }

}

/**
 * Activation Exceptions
 */

 class ActivationException extends Exception {
    
    static code = 'E_ACTIVATION'

    static NoRandomOptions() {
        return new this('Trying to pick random activation from empty options list', this.code);
    }
    
}