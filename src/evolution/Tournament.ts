import Evolution, { IEvolutionConfig } from "../Evolution";
import { Genome } from "../Genome";
import Population, { Individual } from "../MONEAT";

export interface ITournamentConfig extends IEvolutionConfig {

    /** Elit: Don't mutate the best individuals */
    elit: number,
    /** Death Rate: [0~1] Rate of population to kill at each epoch */
    death_rate: number,
    /** Crossover Rate: [0~1] Rate of new individuals created from crossover. The rest of the population is filled with new random genomes  */
    crossover_rate: number

}
export function TournamentConfig(config: Omit<ITournamentConfig, 'class'>) { return { ...config, class: Tournament } }

export default class Tournament extends Evolution {

    protected config!: ITournamentConfig

    Epoch(population: Individual[]): Individual[] {

        let n = population.length;

        population = this.Sort(population);
        population = this.Death(population);
        
        let crossover = Math.floor(n*this.config.crossover_rate);
        population = this.Reproduce(population, crossover);
        population = this.NewRandomGenomes(population, population.length-n);

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
    Reproduce(population: Individual[], n: number) {
        let peers = population.slice(0,n);
        for (let i = 0; i < peers.length; i++) {
            let a = peers[peers.length*Math.floor(Math.random()*peers.length)];
            let b = peers[peers.length*Math.floor(Math.random()*peers.length)];
            population.push({
                genome: a.genome.Crossover(b.genome),
                network: null as any,
                fitness: []
            })
        }
        return population;
    }

    /** Create new random genomes on population */
    NewRandomGenomes(population: Individual[], n: number) {
        for (let i = 0; i < n; i++) {
            population.push({
                genome: new Genome(this.genome_config),
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