import { Genome, IGenomeConfig } from "./Genome";
import Population, { Individual } from "./MONEAT";

export interface IEvolutionConfig {
    class: typeof Evolution
}

export function EvolutionConfig(config: IEvolutionConfig) {return config;}

export default abstract class Evolution {

    constructor(
        protected config: IEvolutionConfig,
        protected genome_config: IGenomeConfig
    ) {}

    abstract Epoch(population: Individual[]): Individual[] 

}