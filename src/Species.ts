import { Genome } from "./Genome"
import { IMONEATConfig, Individual } from "./MONEAT"
import { StringID } from "./util/Random"

export class Species {

    id: string
    population: Individual[] = []
    fitness: number[]
    stagnation: number = 0
    avg_dist: number = 0

    constructor(
        public representative: Individual,
        private config: IMONEATConfig
    ) {
        this.id = StringID();
        this.fitness = Array(config.fitness.length).fill(0)
    }

    AddIndividual(individual: Individual): boolean {
        let dist = this.CompatibilityDistance(individual.genome, this.representative.genome);
        let threshold = this.config.species.compatibility.threshold;
        if (dist < threshold) {
            this.population.push(individual);
            this.avg_dist += dist;
            return true;
        }
        return false;
    }

    CompatibilityDistance(a: Genome, b: Genome) {

        let c1 = this.config.species.compatibility.excess_coeff;
        let c2 = this.config.species.compatibility.disjoint_coeff;
        let c3 = this.config.species.compatibility.weights_coeff;

        let dist = a.Distance(b);
        let nodes = (c1*dist.nodes.excess + c2*dist.nodes.disjoint + c3*dist.nodes.matching)/dist.nodes.larger;
        let conns = (c1*dist.conns.excess + c2*dist.conns.disjoint + c3*dist.conns.matching)/dist.conns.larger;

        return nodes + conns;
    }

}