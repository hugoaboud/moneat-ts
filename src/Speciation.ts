import { Genome } from "./Genome";
import { Individual } from "./MONEAT";
import { Species } from "./Species";

export interface ISpeciationConfig {
    class: typeof Speciation,
    compatibility: {
        excess_coeff: number
        disjoint_coeff: number
        weights_coeff: number
    },
    stagnation_threshold: number
}

export abstract class Speciation {
    
    protected species: Species[] = []

    constructor(
        protected config: ISpeciationConfig
    ) {}

    abstract Speciate(population: Individual[]): void
    
    abstract AfterSort(population: Individual[]): void

    /** 
     * Explicit Fitness Sharing
     */
    ShareFitnesses() {
        let f = this.species[0].population[0].fitness.length;

        for (let i = 0; i < this.species.length; i++) {
            let specie = this.species[i]; 

            let specie_fitness = Array(f).fill(0);
            for (let j = 0; j < specie.population.length; j++) {
                let ind = specie.population[j];
                ind.shared_fitness = ind.fitness.map((fit,k) => {
                    fit /= specie.population.length;
                    specie_fitness[k] += fit;
                    return fit;
                });
            }

            let diff = 0;
            for (let j = 0; j < specie.fitness.length; j++) {
                diff += Math.abs(specie.fitness[j] - specie_fitness[j]);
            }
            if (diff <= this.config.stagnation_threshold) specie.stagnation++;
            else specie.stagnation = 0;
            specie.fitness = specie_fitness;
        }
    }

    CompatibilityDistance(a: Genome, b: Genome) {

        let c1 = this.config.compatibility.excess_coeff;
        let c2 = this.config.compatibility.disjoint_coeff;
        let c3 = this.config.compatibility.weights_coeff;

        let dist = a.Distance(b);
        let nodes = (c1*dist.nodes.excess + c2*dist.nodes.disjoint + c3*dist.nodes.matching)/dist.nodes.larger;
        let conns = (c1*dist.conns.excess + c2*dist.conns.disjoint + c3*dist.conns.matching)/dist.conns.larger;

        return nodes + conns;
    }

    getSpecies() {return this.species;}
}