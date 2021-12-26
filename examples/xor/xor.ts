/**
 * MONEAT: Multi-Objective NeuroEvolution of Augmenting Topologies
 * [Examples] XOR
 * 
 * This is a 'Hello World' on how to use MONEAT. You can run it through
 * the CLI or (even better) copy it into a file and try it out!
 */

import MONEAT from "../../src/MONEAT";
import { NeuralNetwork } from "../../src/NeuralNetwork";
import { DefaultMONEATConfig } from "../../src/util/Defaults";

/*
    NeuroEvolution allows you to define really 'abstract' challenges for a network, unlike
    Back-Propagation, which usually requires stablishing the error at each output neuron.

    MONEAT allows you to define any method for evaluating a network, such as playing a game,
    processing an image, reading a text, etc. As long as it returns a number representing the
    fitness of that network on that task you should be able to evolve it to some degree.
    
    Greater Fitness <=> Better Genome

    The XOR example is pretty simple:
        - Given two inputs which are either 0 or 1
        - The network outputs a single number between -1 and 1
        - An error is calculated, with value ranging from 0 (1,1) to 2 (1,-1)
        - The fitness is returned as 8 minus the total of errors for 4 input cases
*/

const Input = [ [0,0],[0,1],[1,0],[1,1] ]
const Output = [ 0,1,1,0 ]

function XOR(network: NeuralNetwork): number {
    let e = 8;
    for (let i = 0; i < Input.length; i++) {
        let out = network.Run(Input[i]);
        e -= Math.abs(out[0] - Output[i]);
    }
    return e;
}

/*
    After defining the challenge above, it's very simple to start using MONEAT.
        - Create a config (check the docs!)
        - Create a MONEAT instance from that config
        - Evolve your Networks!
*/

const Config = DefaultMONEATConfig({
    fitness: [XOR]
});
const MoNeat = new MONEAT(Config);
let population = MoNeat.Evolve(100);
console.dir(population[0],{depth:null});