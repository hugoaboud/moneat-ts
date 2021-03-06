import { Genome } from "./Genome";
import { Graph } from "./Graph";
import { Exception } from "./util/Exception";

export abstract class NeuralNetwork {    

    protected id: string

    protected inputs: number
    protected outputs: number
    protected graph: Graph

    constructor(
        genome: Genome
    ) {
        this.graph = new Graph(genome);
        this.id = this.graph.genome.getID();
        this.inputs = this.graph.genome.getInputCount();
        this.outputs = this.graph.genome.getOutputCount();
    }

    Run(input: number[], reset=false): number[] {
        if (input.length != this.inputs) throw NetworkException.WrongInputLength(this.inputs, input.length);
        if (reset) this.Reset();
        return this.Calc(input);
    }
    protected abstract Calc(input: number[]): number[]

    abstract Reset(): void
}

/**
 * Network Exceptions
 */

 class NetworkException extends Exception {
    
    static code = 'E_NETWORK'

    static WrongInputLength(expected: number, received: number) {
        return new this(`Wrong input data length. expected: ${expected}, received: ${received}`, this.code);
    }

}