import { Individual } from "../MONEAT";
import { ISpeciationConfig, Speciation } from "../Speciation";
import { Species } from "../Species";

export interface INEATSpeciationConfig extends ISpeciationConfig {
    distance_threshold: number
}
export function NEATSpeciationConfig(config: Omit<INEATSpeciationConfig, 'class'>) { return { ...config, class: NEATSpeciation } }

export class NEATSpeciation extends Speciation {

    protected config!: INEATSpeciationConfig

    /*
     *  Speciation 
     */

    Speciate(population: Individual[]) {

        // New empty species with parent representatives
        for (let s = 0; s < this.species.length; s++) {
            this.species[s].population = [];
        }   

        // Assign each individual to an species
        for (let i = 0; i < population.length; i++) {
            let ind = population[i];
            let match = false;
            for (let j = 0; j < this.species.length; j++) {
                if (this.TryAddIndividualToSpecies(ind, this.species[j], this.config.distance_threshold)) {
                    match = true;
                    break;
                }
            }
            if (!match) {
                let specie = new Species(ind, this.config);
                specie.population = [ind];
                this.species.push(specie);
            }
        }

        // Filter empty species
        this.species = this.species.filter(s => s.population.length);

        // Average distance
        this.species.map(species => {
            species.avg_dist /= species.population.length;
        })

    }

    TryAddIndividualToSpecies(individual: Individual, species: Species, threshold: number): boolean {
        let dist = this.CompatibilityDistance(individual.genome, species.representative.genome);
        if (dist < threshold) {
            species.population.push(individual);
            species.avg_dist += dist;
            return true;
        }
        return false;
    }

    AfterSort(population: Individual[]): void {
        this.ElectRepresentatives(population);
    }

    ElectRepresentatives(population: Individual[]) {
        for (let s = 0; s < this.species.length; s++) {
            let specie = this.species[s];
            let best_index = Infinity;
            let best = null as any;
            for (let i = 0; i < specie.population.length; i++) {
                let individual = specie.population[i];
                let index = population.indexOf(individual);
                if (index < best_index) {
                    best_index = index;
                    best = individual;
                }
            }
            specie.representative = best;
        }
    }

    
    

}