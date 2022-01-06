import { Activation } from "../Activation";
import { IBooleanAttributeConfig, INumericAttributeConfig } from "../Attribute";
import { IEvolutionConfig } from "../Evolution";
import { TournamentConfig, ITournamentConfig } from "../evolution/Tournament";
import { IGenomeConfig } from "../Genome";
import { Aggregation, IMONEATConfig, MONEATConfig } from "../MONEAT";
import { DNeuralNetwork } from "../neuralnetwork/Default";
import { ISpeciationConfig } from "../Speciation";
import { INEATSpeciationConfig, NEATSpeciationConfig } from "../speciation/NEATSpeciation";
import { DeepPartial, Merge } from "./Config";

export function DefaultNumericAttributeConfig(config?: DeepPartial<INumericAttributeConfig>): INumericAttributeConfig {
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
export function DefaultBooleanAttributeConfig(config?: DeepPartial<IBooleanAttributeConfig>): IBooleanAttributeConfig {
    return Merge({
        init: true,
        mutation: {
            prob: 0.01
        }
    }, config);
}

export function DefaultGenomeConfig(config?: DeepPartial<IGenomeConfig>): IGenomeConfig {
    return Merge({
        inputs: 2,
        outputs: 1,
        bias: DefaultNumericAttributeConfig(),
        mult: DefaultNumericAttributeConfig({
            init: {
                mean: 1,
                stdev: 0
            },
            mutation: {
                rate: 0,
                prob: {
                    offset: 0,
                    replace: 0
                }
            }
        }),
        weight: DefaultNumericAttributeConfig({
            mutation: {
                prob: {
                    offset: 0.8
                }
            }
        }),
        enabled: DefaultBooleanAttributeConfig(),
        activation: {
            hidden: [Activation.Sigmoid],
            output: [Activation.Sigmoid]
        },
        mutation: {
            single: true,
            add_node: 0.1,
            remove_node: 0.1,
            add_connection: 0.25,
            remove_connection: 0.25
        },
        aggregation: {
            default: Aggregation.Sum,
            mutation: {
                prob: 0,
                options: [Aggregation.Sum]
            }
        },
        feedforward: true,
        initial_connection_prob: 1
    }, config);
}

export function DefaultNEATSpeciationConfig(config?: DeepPartial<INEATSpeciationConfig>): INEATSpeciationConfig {
    return Merge(NEATSpeciationConfig({
        compatibility: {
            excess_coeff: 1.0,
            disjoint_coeff: 1.0,
            weights_coeff: 0.5,
        },
        distance_threshold: 3.0,
        stagnation_threshold: 0.01
    }),config);
}

export function DefaultTournamentConfig(config?: DeepPartial<ITournamentConfig>): ITournamentConfig {
    return Merge(TournamentConfig({
        elit: 2,
        death_rate: 0.8,
        max_stagnation: 20
    }),config);
}

export function DefaultMONEATConfig(config?: DeepPartial<IMONEATConfig>): IMONEATConfig {
    return Merge({
        population: 100,
        genome: DefaultGenomeConfig(),
        speciation: DefaultNEATSpeciationConfig(),
        network: DNeuralNetwork,
        fitness: [],
        evolution: DefaultTournamentConfig(),
        fitness_epsilon: 0.01
    }, config);
}

function DefaultSpeciationConfig(arg0: { compatibility: { excess_coeff: number; disjoint_coeff: number; weights_coeff: number; }; distance_threshold: number; }): any {
    throw new Error("Function not implemented.");
}
