import Evolution, { IEvolutionConfig } from "./Evolution";
import Fitness from "./Fitness";
import { Genome, IGenomeConfig } from "./Genome"
import { BaseNeuralNetwork } from "./NeuralNetwork";

/**
 * NEAT Configuration
 */

export interface INEATConfig {

    population: number
    genome: IGenomeConfig
    network: typeof BaseNeuralNetwork
    fitness: (typeof Fitness)[]
    evolution: IEvolutionConfig
    
}

export function NEATConfig(config: INEATConfig) {return config;}

/**
 * An individual of the population
 */

export interface Individual {
    genome: Genome,
    network: BaseNeuralNetwork,
    fitness: number[]
}

/**
 * NEAT
 */

export default class NEAT {

    protected population: Individual[] = []

    constructor(
        protected config: INEATConfig
    ) {
        this.Reset();
    }

    Reset() {
        this.population = Array.from({length: this.config.population}, () => ({
            genome: new Genome(this.config.genome),
            network: null as any,
            fitness: []
        } as Individual))
    }

    Evolve(input: number[][], epochs: number) {

        this.population.map(ind => {
            ind.network = new (this.config.network as any)(ind.genome)
            ind.fitness = []
        });
        
        let evolution = new (this.config.evolution.class as any)(this.config.evolution, this.config.genome)

        for (let e = 0; e < epochs; e++) {
        
            // Run all networks
            for (let n = 0; n < this.population.length; n++) {
                let network = this.population[n].network;
                network.Reset();
                for (let i = 0; i < input.length; i++) {
                    network.Run(input[i]);
                }
            }

            // Calculate fitnesses
            for (let f = 0; f < this.config.fitness.length; f++) {
                let fit = new (this.config.fitness[f] as any)(input);
                for (let n = 0; n < this.population.length; n++) {
                    this.population[n].fitness[f] = fit.Calc(this.population[n].network);
                }
            }

            // Evolution epoch
            this.population = evolution.Epoch(this.population);
        }

    }

}