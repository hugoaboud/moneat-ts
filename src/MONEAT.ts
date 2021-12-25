import Evolution, { IEvolutionConfig } from "./Evolution";
import {FitnessMethod} from "./Fitness";
import { Genome, IGenomeConfig } from "./Genome"
import { NeuralNetwork } from "./NeuralNetwork";

/**
 * NEAT Configuration
 */

export interface IMONEATConfig {

    population: number
    genome: IGenomeConfig
    network: typeof NeuralNetwork
    fitness: FitnessMethod[]
    evolution: IEvolutionConfig
    
}

export function MONEATConfig(config: IMONEATConfig) {return config;}

/**
 * An individual of the population
 */

export interface Individual {
    genome: Genome,
    network: NeuralNetwork,
    fitness: number[]
}

/**
 * NEAT
 */

export default class MONEAT {

    protected population: Individual[] = []

    constructor(
        protected config: IMONEATConfig
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

    ResetNetworkAndFitness(ind: Individual) {
        ind.network = new (this.config.network as any)(ind.genome)
        ind.fitness = []
    }

    Evolve(epochs: number) {
        
        // Evolve individuals
        let evolution = new (this.config.evolution.class as any)(this.config.evolution, this.config.genome)
        for (let e = 0; e < epochs; e++) {

            // Reset networks and fitnesses
            this.population.map(ind => this.ResetNetworkAndFitness(ind));

            // Calculate fitnesses
            for (let f = 0; f < this.config.fitness.length; f++) {
                let method = this.config.fitness[f];
                for (let n = 0; n < this.population.length; n++) {
                    this.population[n].fitness[f] = method(this.population[n].network);
                }
            }

            // Don't evolve last population
            if (e == epochs-1) break;

            // Evolution epoch
            this.population = evolution.Epoch(this.population);

        }

        return this.Output();

    }

    Output() {
        return this.population;
    }

}