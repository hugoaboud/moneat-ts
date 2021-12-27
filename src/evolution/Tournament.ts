import Evolution, { IEvolutionConfig } from "../Evolution";
import MONEAT, { IMONEATConfig, Individual, Species } from "../MONEAT";
import Log, { LogLevel } from "../util/Log";

export interface ITournamentConfig extends IEvolutionConfig {

    /** Elit: Don't mutate the best individuals */
    elit: number,
    /** Death Rate: [0~1] Rate of population to kill at each epoch */
    death_rate: number,

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

    protected epoch = 0;

    OffspringBySpecies(species: Species[]): number[] {
        if (Log.Level === LogLevel.DEBUG)
            Log.Method(this, 'OffspringBySpecies', `(species:${species.length})`, LogLevel.DEBUG);
            
        let fitness_sum = 0;
        for (let i = 0; i < species.length; i++)
            fitness_sum += species[i].fitness[0];
            
        let n = this.moneat_config.population;
        let n_out = 0;
        let e_out = 0;
        let offspring = species.map((sp,i) => {
            let elit = Math.min(sp.population.length, this.config.elit)
            let sp_offspring = Math.floor(n * (sp.fitness[0]/fitness_sum))
            let o = Math.max(elit,sp_offspring) - elit;
            n_out += o;
            e_out += elit;
            return o;
        })

        // Ensure fixed size population
        if (n_out < n-e_out) offspring[0] += (n-e_out-n_out)
        if (Log.Level === LogLevel.DEBUG)
            Log.Method(this, 'OffspringBySpecies', ` => offspring:[${offspring.toString()}]`, LogLevel.DEBUG);
        return offspring;
    }
    
    Epoch(moneat: MONEAT): Individual[] {
        let species = moneat.getSpecies();
        Log.Method(this, 'Epoch', `(epoch:${this.epoch++}, species:${species.length})`, LogLevel.INFO);

        let o = this.OffspringBySpecies(species);
        let offspring = [] as Individual[];
        for (let i = 0; i < species.length; i++) {
            offspring = offspring.concat(this.SpeciesEpoch(i, species[i], o[i]))
        }
        return offspring;
    }

    SpeciesEpoch(i: number, species: Species, offspring: number): Individual[] {
        Log.Method(this, `SpeciesEpoch.${i}`, `(population:${species.population.length},offspring:${offspring})`, LogLevel.INFO);

        let population = species.population;

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
        let end = Math.ceil(population.length*this.config.death_rate);
        return population.slice(0,Math.max(this.config.elit,end));
    }

    /** Reproduce population among itself */
    Reproduce(population: Individual[], offspring: number) {
        let newborns = [];
        for (let i = 0; i < offspring; i++) {
            let ra = Math.floor(Math.random()*population.length);
            let rb = Math.floor(Math.random()*population.length);
            let a = population[ra];
            let b = population[rb];
            newborns.push({
                genome: (a.shared_fitness[0] > b.shared_fitness[0])?a.genome.Crossover(b.genome):b.genome.Crossover(a.genome),
                network: null as any,
                fitness: [],
                shared_fitness: []
            })
        }
        return population.slice(0,this.config.elit).concat(newborns);
    }

    /** Mutate population (except elit) */
    Mutate(population: Individual[]) {
        population.slice(this.config.elit).map(ind => ind.genome.Mutate())
        return population;
    }

}