import { Activation } from "../Activation";
import { IAttributeConfig } from "../Attribute";
import { IEvolutionConfig } from "../Evolution";
import { TournamentConfig, ITournamentConfig } from "../evolution/Tournament";
import { IGenomeConfig } from "../Genome";
import { Aggregation, IMONEATConfig, MONEATConfig } from "../MONEAT";
import { DNeuralNetwork } from "../neuralnetwork/Default";
import { DeepPartial, Merge } from "./Config";

export function DefaultAttributeConfig(config?: DeepPartial<IAttributeConfig>): IAttributeConfig {
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
        bias: DefaultAttributeConfig(),
        weight: DefaultAttributeConfig(),
        mult: DefaultAttributeConfig(),
        activation: {
            hidden: [Activation.Sigmoid],
            output: [Activation.Sigmoid]
        },
        mutation: {
            single: true,
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