import Evolution, { IEvolutionConfig } from "./Evolution";
import {FitnessMethod} from "./Fitness";
import { Genome, IGenomeConfig } from "./Genome"
import { NodeInnovation, ConnInnovation, InnovationRanges } from "./Innovation";
import { NeuralNetwork } from "./NeuralNetwork";
import { Species } from "./Species";
import { Exception } from "./util/Exception";
import Log, { LogLevel } from "./util/Log";
import { StringID } from "./util/Random";

/**
 * NEAT Configuration
 */

export enum Aggregation {
    Sum,
    max
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
    fitness_epsilon: number

}

export function MONEATConfig(config: IMONEATConfig) {return config;}

/**
 * An individual of the population
 */

export interface Individual {
    species: Species
    genome: Genome
    network: NeuralNetwork
    fitness: number[]
    shared_fitness: number[]
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
        if (this.config.population <= 0) throw MONEATException.InvalidPopulationSizse();
        this.Reset();
    }

    /*
     *  Population Reset
     */

    Reset() {
        this.population = Array.from({length: this.config.population}, () => ({
            genome: new Genome(this.config.genome),
            network: null as any,
            fitness: [],
            shared_fitness: [],
            species: null as any
        } as Individual));
        this.population.map(pop => Log.Genome(pop.genome));
        this.Speciate();
    }

    ResetIndividual(ind: Individual) {
        ind.network = new (this.config.network as any)(ind.genome)
        ind.fitness = []
        ind.shared_fitness = []
    }

    /*
     *  Speciation 
     */

    Speciate() {

        // New empty species with parent representatives
        for (let s = 0; s < this.species.length; s++) {
            this.species[s].population = [];
        }

        // Assign each individual to an species
        for (let i = 0; i < this.population.length; i++) {
            let ind = this.population[i];
            let match = false;
            for (let j = 0; j < this.species.length; j++) {
                if (this.species[j].AddIndividual(ind)) {
                    match = true;
                    break;
                }
            }
            if (!match) {
                let specie = new Species(ind, this.config);
                specie.population = [ind];
                this.species.push(specie);
            }
        }

        // Filter empty species
        this.species = this.species.filter(s => s.population.length);

        // Average distance
        this.species.map(species => {
            species.avg_dist /= species.population.length;
        })

    }

    ElectSpeciesRepresentatives() {
        for (let s = 0; s < this.species.length; s++) {
            let specie = this.species[s];
            let best_index = Infinity;
            let best = null as any;
            for (let i = 0; i < specie.population.length; i++) {
                let individual = specie.population[i];
                let index = this.population.indexOf(individual);
                if (index < best_index) {
                    best_index = index;
                    best = individual;
                }
            }
            specie.representative = best;
        }
    }

    /** 
     * Explicit Fitness Sharing
     */
    ShareFitnesses() {
        for (let i = 0; i < this.species.length; i++) {
            let specie = this.species[i]; 

            let specie_fitness = Array(this.config.fitness.length).fill(0);
            for (let j = 0; j < specie.population.length; j++) {
                let ind = specie.population[j];
                ind.shared_fitness = ind.fitness.map((f,k) => {
                    let fit = f/specie.population.length;
                    specie_fitness[k] += fit;
                    return fit;
                });
            }

            let diff = 0;
            for (let j = 0; j < specie.fitness.length; j++) {
                diff += Math.abs(specie.fitness[j] - specie_fitness[j]);
            }
            if (diff <= this.config.fitness_epsilon) specie.stagnation++;
            else specie.stagnation = 0;
            specie.fitness = specie_fitness;
        }
    }

    /*
     *  Evolution
     */

    Evolve(epochs: number, goal?: (best: number[], avg: number[]) => boolean) {
        Log.Method(this, 'Evolve', `(epochs:${epochs})`, LogLevel.INFO);

        // Run epochs
        let evolution = new (this.config.evolution.class as any)(this.config) as Evolution
        for (let e = 0; e < epochs; e++) {
            Log.Method(this, `Evolve.${e}`, `()`, LogLevel.INFO);

            // Reset individuals (new networks, zero fitness)
            this.population.map(ind => this.ResetIndividual(ind));
            
            // Calculate fitnesses
            for (let f = 0; f < this.config.fitness.length; f++) {
                let method = this.config.fitness[f];
                for (let n = 0; n < this.population.length; n++) {
                    this.population[n].fitness[f] = method(this.population[n].network) || -999;
                }
            }
            this.ShareFitnesses();

            this.population = evolution.Sort(this.population);
            this.ElectSpeciesRepresentatives();

            let {best, avg} = this.ReportFitness();

            if (goal)
                if (goal(best, avg)) break;

            // Don't evolve on last epoch
            if (e == epochs-1) break;
                
            this.population = evolution.Epoch(this);
            this.Speciate();

            if (Log.Level == LogLevel.DEBUG)
                this.population.map(p => Log.Genome(p.genome));
        }

        return this.Output();

    }

    ReportFitness() {
        let best = Array(this.config.fitness.length).fill(-Infinity);
        let sum = Array(this.config.fitness.length).fill(0);
        let population = this.population.sort((a,b) => b.fitness[0]-a.fitness[0]);
        population.map(ind => {
            Log.Data(this, `Fitness.Individual.${ind.genome.getID()}`, ind.fitness, LogLevel.DEBUG)
            ind.fitness.map((f,i) => {
                if (f > best[i]) best[i] = f;
                sum[i] += f;
            })
        })
        let avg = sum.map(f => f/this.population.length);
        this.species.map((species,i) => {
            Log.Data(this, `Fitness.Species.${i}`, {
                id: species.id,
                pop: species.population.length,
                fitness: species.fitness,
                stagnation: species.stagnation,
                avg_dist: species.avg_dist
            }, LogLevel.INFO);
        })
        Log.Data(this, 'Fitness', {
            best,
            avg
        }, LogLevel.INFO)
        return {best, avg}
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

/**
 * MONEAT Exceptions
 */
class MONEATException extends Exception {
    
    static code = 'E_MONEAT'

    static InvalidPopulationSizse() {
        return new this('(config) Population size should be greater than 0', this.code);
    }
    
}