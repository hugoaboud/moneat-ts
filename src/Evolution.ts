import MONEAT, { IMONEATConfig, Individual } from "./MONEAT";
export interface IEvolutionConfig {
    class: typeof Evolution
}
export function EvolutionConfig(config: IEvolutionConfig) {return config;}
export default abstract class Evolution {

    protected config: IEvolutionConfig

    constructor(
        protected moneat_config: IMONEATConfig
    ) {
        this.config = moneat_config.evolution;
    }

    abstract Sort(population: Individual[]): Individual[]

    abstract Epoch(moneat: MONEAT): Individual[] 

}