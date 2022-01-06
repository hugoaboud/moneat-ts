import { Genome } from "./Genome"
import { IMONEATConfig, Individual } from "./MONEAT"
import { ISpeciationConfig } from "./Speciation"
import { StringID } from "./util/Random"

export class Species {

    id: string
    population: Individual[] = []
    fitness: number[]
    stagnation: number = 0
    avg_dist: number = 0

    constructor(
        public representative: Individual,
        private config: ISpeciationConfig,
        fitness_length: number
    ) {
        this.id = StringID();
        this.fitness = Array(fitness_length).fill(0)
    }   

}