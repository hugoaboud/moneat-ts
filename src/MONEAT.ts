import Evolution, { IEvolutionConfig } from "./Evolution";
import {FitnessMethod} from "./Fitness";
import { Genome, IGenomeConfig } from "./Genome"
import { NodeInnovation, ConnInnovation, InnovationRanges } from "./Innovation";
import { NeuralNetwork } from "./NeuralNetwork";
import { ISpeciationConfig, Speciation } from "./Speciation";
import { Species } from "./Species";
import { Exception } from "./util/Exception";
import Log, { LogLevel } from "./util/Log";
import { StringID } from "./util/Random";

/**
 * NEAT Configuration
 */
export interface IMONEATConfig {

    population: number
    
    genome: IGenomeConfig
    network: typeof NeuralNetwork

    fitness: FitnessMethod[]
    fitness_epsilon: number

    speciation: ISpeciationConfig
    evolution: IEvolutionConfig
    
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
    protected speciation!: Speciation

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
        
        this.speciation = new (this.config.speciation.class as any)(this.config.speciation) as Speciation
        this.speciation.Speciate(this.population);
    }

    ResetIndividual(ind: Individual) {
        ind.network = new (this.config.network as any)(ind.genome)
        ind.fitness = []
        ind.shared_fitness = []
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
                    this.population[n].fitness[f] = method(this.population[n].network);
                }
            }
            this.speciation.ShareFitnesses();

            this.population = evolution.Sort(this.population);
            this.speciation.AfterSort(this.population);

            let {best, avg} = this.ReportFitness();
            if (goal  && goal(best, avg)) break;

            // Don't evolve on last epoch
            if (e == epochs-1) break;
                
            this.population = evolution.Epoch(this);
            this.speciation.Speciate(this.population);

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
        this.speciation.getSpecies().map((species,i) => {
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
    getSpecies() { return this.speciation.getSpecies() }

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