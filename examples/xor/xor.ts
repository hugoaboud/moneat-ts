import MONEAT from "../../src/MONEAT";
import { NeuralNetwork } from "../../src/NeuralNetwork";
import { DefaultMONEATConfig } from "../../src/util/Defaults";

// 
const Config = DefaultMONEATConfig({
    fitness: [XORFitness]
});
const MoNeat = new MONEAT(Config);

const Input = [ [0,0],[0,1],[1,0],[1,1] ]
const Output = [ 0,1,1,0 ]

const Epochs = 100;

function XORFitness(network: NeuralNetwork) {
    let e = 0;
    for (let i = 0; i < Input.length; i++) {
        let out = network.Run(Input[i]);
        e += Math.abs(out[0] - Output[i]);
    }
    return e;
}

let output = MoNeat.Evolve(Epochs);

console.log(output);