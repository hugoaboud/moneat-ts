import Evolution, { IEvolutionConfig } from "../Evolution";
import { Genome } from "../Genome";
import Population, { Individual } from "../NEAT";

export interface IBinaryTournamentConfig extends IEvolutionConfig {

    /** Elit: Don't mutate the best individuals */
    elit: number,
    /** Death Rate: [0~1] Rate of population to kill at each epoch */
    death_rate: number,
    /** Crossover Rate: [0~1] Rate of new individuals created from crossover. The rest of the population is filled with new random genomes  */
    crossover_rate: number

}
export function BinaryTournamentConfig(config: Omit<IBinaryTournamentConfig, 'class'>) { return { ...config, class: BinaryTournament } }

export default class BinaryTournament extends Evolution {

    protected config!: IBinaryTournamentConfig

    Epoch(population: Individual[]): Individual[] {
        
        // Sort by (single) fitness
        let n = population.length;
        population = population.sort((a,b) => b.fitness[0] - a.fitness[0])

        // Death
        population = population.slice(0,Math.floor(population.length*this.config.death_rate))

        // Crossover
        let peers = population.slice(0,Math.floor(n*this.config.crossover_rate));
        for (let i = 0; i < peers.length; i++) {
            let a = peers[peers.length*Math.floor(Math.random()*peers.length)];
            let b = peers[peers.length*Math.floor(Math.random()*peers.length)];
            population.push({
                genome: a.genome.Crossover(b.genome),
                network: null as any,
                fitness: []
            })
        }

        // Random new individuals
        n = population.length - n;
        for (let i = 0; i < n; i++) {
            population.push({
                genome: new Genome(this.genome_config),
                network: null as any,
                fitness: []
            })
        }

        return population;
    }



}