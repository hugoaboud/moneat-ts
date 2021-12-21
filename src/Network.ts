import { Genome } from "./Genome";

/**
 * Recurrent Neural Network
 */

export class Network {

    nodes: number[] = []
    weights: number[] = []
    biases: number[] = []
    responses: number[] = []
    
    constructor(genome: Genome) {

        console.log(genome);

    }

}