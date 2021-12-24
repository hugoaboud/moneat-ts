import { Activation } from "../Activation";
import { IEvolutionConfig } from "../Evolution";
import { BinaryTournamentConfig, IBinaryTournamentConfig } from "../evolution/BinaryTournament";
import { IGenomeConfig, IMutableParamConfig } from "../Genome";
import { INEATConfig, NEATConfig } from "../NEAT";
import { NeuralNetwork } from "../neuralnetwork/Default";

export function DefaultMutableParamConfig(): IMutableParamConfig {
    return {
        min: -30,
        max: 30,
        init: {
            mean: 0,
            stdev: 1
        },
        mutation: {
            rate: 0.5,
            prob: {
                offset: 0.7,
                replace: 0.1
            }
        }
    }
}

export function DefaultGenomeConfig(): IGenomeConfig {
    return {
        inputs: 2,
        outputs: 1,

        bias: DefaultMutableParamConfig(),
        weight: DefaultMutableParamConfig(),
        mult: DefaultMutableParamConfig(),

        activation: {
            hidden: [Activation.Clamped],
            output: [Activation.Clamped]
        },

        recurrent: false
    }
}

export function DefaultBinaryTournamentConfig(): IBinaryTournamentConfig {
    return BinaryTournamentConfig({
        elit: 2,
        death_rate: 0.5,
        crossover_rate: 0.7
    })
}

export function DefaultNEATConfig(): INEATConfig {
    return NEATConfig({
        population: 100,
        genome: DefaultGenomeConfig(),
        network: NeuralNetwork,
        fitness: [],
        evolution: DefaultBinaryTournamentConfig()
    })
}