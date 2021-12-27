import { Activation } from "../Activation";
import { IEvolutionConfig } from "../Evolution";
import { TournamentConfig, ITournamentConfig } from "../evolution/Tournament";
import { IGenomeConfig, IMutableParamConfig } from "../Genome";
import { Aggregation, IMONEATConfig, MONEATConfig } from "../MONEAT";
import { DNeuralNetwork } from "../neuralnetwork/Default";
import { DeepPartial, Merge } from "./Config";

export function DefaultMutableParamConfig(config?: DeepPartial<IMutableParamConfig>): IMutableParamConfig {
    return Merge({
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
    }, config);
}

export function DefaultGenomeConfig(config?: DeepPartial<IGenomeConfig>): IGenomeConfig {
    return Merge({
        inputs: 2,
        outputs: 1,
        bias: DefaultMutableParamConfig(),
        weight: DefaultMutableParamConfig(),
        mult: DefaultMutableParamConfig(),
        activation: {
            hidden: [Activation.Clamped],
            output: [Activation.Clamped]
        },
        mutation: {
            add_node: 0.2,
            remove_node: 0.2,
            add_connection: 0.5,
            remove_connection: 0.5
        },
        aggregation: {
            default: Aggregation.Sum,
            mutation: {
                prob: 0,
                options: [Aggregation.Sum]
            }
        },
        recurrent: false
    }, config);
}

export function DefaultTournamentConfig(config?: DeepPartial<ITournamentConfig>): ITournamentConfig {
    return Merge(TournamentConfig({
        elit: 2,
        death_rate: 0.5,
        crossover_rate: 0.7,
        stagnation: {
            threshold: 0.001,
            max_epochs: 20,
            top_species: 2
        }
    }),config);
}

export function DefaultMONEATConfig(config?: DeepPartial<IMONEATConfig>): IMONEATConfig {
    return Merge({
        population: 100,
        genome: DefaultGenomeConfig(),
        species: {
            fitness_aggr: Aggregation.Sum,
            compatibility: {
                excess_coeff: 1.0,
                disjoint_coeff: 1.0,
                weights_coeff: 0.5,
                threshold: 3.0
            }
        },
        network: DNeuralNetwork,
        fitness: [],
        evolution: DefaultTournamentConfig()
    }, config);
}