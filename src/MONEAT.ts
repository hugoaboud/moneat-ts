import Evolution, { IEvolutionConfig } from "./Evolution";
import {FitnessMethod} from "./Fitness";
import { ConnectionGene, Genome, IGenomeConfig, Innovation } from "./Genome"
import { NeuralNetwork } from "./NeuralNetwork";
import Log, { LogLevel } from "./util/Log";

/**
 * NEAT Configuration
 */

export enum Aggregation {
    Sum,
    Max
}
export interface IMONEATConfig {

    population: number
    
    genome: IGenomeConfig
    species: {
        fitness_aggr: Aggregation
        compatibility: {
            excess_coeff: number
            disjoint_coeff: number
            weights_coeff: number
            threshold: number
        }
    }
    
    network: typeof NeuralNetwork
    fitness: FitnessMethod[]
    evolution: IEvolutionConfig

}

export function MONEATConfig(config: IMONEATConfig) {return config;}

/**
 * An individual of the population
 */

export interface Individual {
    genome: Genome
    network: NeuralNetwork
    fitness: number[]
}

export interface Species {
    representative: Individual
    population: Individual[]
    fitness: number[]
}

/**
 * NEAT
 */

export default class MONEAT {

    protected population: Individual[] = []
    protected species: Species[] = []

    constructor(
        protected config: IMONEATConfig
    ) {
        this.Reset();
    }

    /*
     *  Population Reset
     */

    Reset() {
        this.population = Array.from({length: this.config.population}, () => ({
            genome: new Genome(this.config.genome),
            network: null as any,
            fitness: []
        } as Individual))
        this.Speciate();
    }

    ResetNetworkAndFitness(ind: Individual) {
        ind.network = new (this.config.network as any)(ind.genome)
        ind.fitness = []
    }

    /*
     *  Speciation 
     */

    CompatibilityDistance(a: Genome, b: Genome) {
        let match = a.MatchGenes(b);

        let E = match.excess.length;
        let D = match.disjoint.length;

        let W = 0;
        for (let i = 0; i < match.matching.length; i++) {
            let a = match.matching[i][0];
            let b = match.matching[i][1];
            if (!b) W += a.weight.value;
            else W += Math.abs(a.weight.value-b.weight.value);
        }

        let c1 = this.config.species.compatibility.excess_coeff;
        let c2 = this.config.species.compatibility.disjoint_coeff;
        let c3 = this.config.species.compatibility.weights_coeff;
        let N = match.larger;

        return (c1*E)/N + (c2*D)/N + c3*W;
    }

    Speciate() {

        // Random representative from each species
        let species = this.species.map((s, i) => ({
            representative: s.population[Math.floor(Math.random()*s.population.length)],
            population: [],
            fitness: Array(this.config.fitness.length).fill(0)
        })) as Species[];

        // Assign each individual to an species
        for (let i = 0; i < this.population.length; i++) {
            let ind = this.population[i];
            let match = false;
            for (let j = 0; j < species.length; j++) {
                let s = species[j];
                let dist = this.CompatibilityDistance(ind.genome, s.representative.genome);
                if (dist <= this.config.species.compatibility.threshold) {
                    species[j].population.push(ind);
                    match = true;
                    break;
                }
            }
            if (!match) {
                species.push({
                    representative: ind,
                    population: [ind],
                    fitness: Array(this.config.fitness.length).fill(0)
                })
            }
        }

        // Filter empty species
        this.species = species.filter(s => s.population.length);
    }

    /** 
     * Explicit Fitness Sharing
     */
    ShareFitnesses() {
        for (let i = 0; i < this.species.length; i++) {
            let s = this.species[i]; 
            let sn = s.population.length;

            for (let j = 0; j < sn; j++) {
                let ind = s.population[j];

                ind.fitness.map((f,i) => {
                    ind.fitness[i] = f/sn;
                    s.fitness[i] += ind.fitness[i];
                });
            }
        }
    }

    /*
     *  Evolution
     */

    Evolve(epochs: number) {
        Log.Method(this, 'Evolve', `(epochs:${epochs})`, LogLevel.INFO);

        // Run epochs
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
            this.ShareFitnesses();

            // Don't evolve last population
            if (e == epochs-1) break;

            // Evolution epoch
            this.population = evolution.Epoch(this.population);
            this.Speciate();
        }

        return this.Output();

    }

    Output() {
        return this.population;
    }

    /*
     *  Getters
     */

    getPopulation() { return this.population }
    getSpecies() { return this.species }

}