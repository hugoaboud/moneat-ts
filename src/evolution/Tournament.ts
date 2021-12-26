import Evolution, { IEvolutionConfig } from "../Evolution";
import { Genome } from "../Genome";
import MONEAT, { IMONEATConfig, Species } from "../MONEAT";
import Population, { Individual } from "../MONEAT";
import Log, { LogLevel } from "../util/Log";

export interface ITournamentConfig extends IEvolutionConfig {

    /** Elit: Don't mutate the best individuals */
    elit: number,
    /** Death Rate: [0~1] Rate of population to kill at each epoch */
    death_rate: number,
    /** Crossover Rate: [0~1] Rate of new individuals created from crossover. The rest of the population is filled with new random genomes  */
    crossover_rate: number

    stagnation: {
        threshold: number
        max_epochs: number
        top_species: number
    }

}
export function TournamentConfig(config: Omit<ITournamentConfig, 'class'>) { return { ...config, class: Tournament } }

export default class Tournament extends Evolution {

    protected moneat_config!: IMONEATConfig
    protected config!: ITournamentConfig

    protected last_fitness_sum: number = 0
    protected stagnation: number = 0

    OffspringBySpecies(species: Species[]): number[] {
        
        let n = this.moneat_config.population;

        let sum = 0;
        for (let i = 0; i < species.length; i++)
            sum += species[i].fitness[0];

        let n2 = 0;
        let offspring = species.map((s,i) => {
            let o = Math.floor(n * (s.fitness[0]/sum))
            n2 += o;
            return o;
        })

        // Ensure fixed size population
        if (n2 < n) offspring[0] += (n2-n)
        return offspring;
    }
    
    Epoch(moneat: MONEAT): Individual[] {
        
        let population = moneat.getPopulation();
        let species = moneat.getSpecies();
        Log.Method(this, 'Epoch', `(species:${species.length})`, LogLevel.INFO);

        let fitness_sum = population.reduce((a,ind) => 
            a + ind.fitness.reduce((a,f) => a + f, 0)
        , 0);
        if (Math.abs(this.last_fitness_sum - fitness_sum) < this.config.stagnation.threshold)
            this.stagnation++;
        else this.stagnation = 0;

        if (this.stagnation > this.config.stagnation.max_epochs)
            species = species.slice(0,this.config.stagnation.top_species)

        let o = this.OffspringBySpecies(species);
        let offspring = [] as Individual[];
        for (let i = 0; i < species.length; i++) {
            offspring = offspring.concat(this.SpeciesEpoch(species[i],o[i]))
        }
        return offspring;
    }

    SpeciesEpoch(species: Species, offspring: number): Individual[] {

        Log.Method(this, 'SpeciesEpoch', `(population:${species.population.length},offspring:${offspring})`, LogLevel.INFO);

        let population = species.population;
        let n = population.length;

        population = this.Sort(population);
        population = this.Death(population);
        
        population = this.Reproduce(population, offspring);
        population = this.Mutate(population);

        return population;
    }

    /** Sort by first fitness */
    Sort(population: Individual[]) {
        return population.sort((a,b) => b.fitness[0] - a.fitness[0])
    }

    /** Remove worst performing individuals from population */
    Death(population: Individual[]) {
        return population.slice(0,Math.floor(population.length*this.config.death_rate))
    }

    /** Reproduce population among itself */
    Reproduce(population: Individual[], offspring: number) {
        let peers = population.slice(0,offspring);
        for (let i = 0; i < peers.length; i++) {
            let a = peers[Math.floor(Math.random()*peers.length)];
            let b = peers[Math.floor(Math.random()*peers.length)];
            population.push({
                genome: a.genome.Crossover(b.genome),
                network: null as any,
                fitness: []
            })
        }
        return population;
    }

    /** Mutate population (except elit) */
    Mutate(population: Individual[]) {
        population.slice(this.config.elit).map(ind => {
            ind.genome.Mutate();
        })
        return population;
    }

}