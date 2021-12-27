import { Exception } from "./util/Exception";

export type ActivationFunction = (v: number) => number
export function RandomActivation(options: ActivationFunction[]) {
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
    },
    
    Sigmoid(v: number) {
        return 1/(1+Math.pow(Math.E, -v));
    }

}