import { BaseNeuralNetwork } from "./NeuralNetwork";

export default abstract class Fitness {

    constructor(protected input: number[][]) {}
    abstract Calc(network: BaseNeuralNetwork): number

}
