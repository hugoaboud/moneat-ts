import { Individual } from "../MONEAT";
import { ISpeciationConfig, Speciation } from "../Speciation";
import { Species } from "../Species";

export interface IClusterSpeciationConfig extends ISpeciationConfig {
}
export function ClusterSpeciationConfig(config: Omit<IClusterSpeciationConfig, 'class'>) { return { ...config, class: ClusterSpeciation } }

export class ClusterSpeciation extends Speciation {

    protected config!: IClusterSpeciationConfig

    Matrix(population: Individual[]): number[][] {
        let length = population.length;
        let matrix = Array.from({length}, () => Array(length).fill(0));
        for (let j = 0; j < length; j++) {
            let ind_a = population[j];
            for (let i = j+1; i < length; i++) {
                let ind_b = population[i];
                matrix[j][i] = this.CompatibilityDistance(ind_a.genome, ind_b.genome);
                matrix[i][j] = matrix[j][i]
            }
        }
        return matrix;
    }

    Speciate(population: Individual[]) {
        this.species = [];

        let matrix = this.Matrix(population);
        let length = population.length;

        let selected = Array(length).fill(false);
        let remaining = length;
        do {
            let min_avg = Infinity;
            for (let i = 0; i < length; i++) {
                if (selected[i]) continue;
                let avg = 0;
                for (let j = 0; j < length; j++) {
                    if (selected[j]) continue;
                    avg += matrix[i][j];
                }
                avg /= remaining;
                if (avg < min_avg)
                min_avg = avg;
            }
            
            let max_density = 0;
            let center = 0;
            for (let i = 0; i < length; i++) {
                if (selected[i]) continue;
                let density = 0;
                for (let j = 0; j < length; j++) {
                    if (i == j) continue;
                    if (selected[j]) continue;
                    if (matrix[i][j] < min_avg) density++;
                }
                if (density > max_density) {
                    center = i;
                    max_density = density;
                }
            }

            if (max_density == 0) {
                let cluster = Array(remaining).fill(null) as Individual[];
                let j = 0;
                for (let i = 0; i < length; i++) {
                    if (selected[i]) continue;
                    cluster[j] = population[i];
                    j++;
                }
                let specie = new Species(cluster[0], this.config)
                specie.population = cluster;
                this.species.push(specie);
                break;
            }

            let cluster = Array(max_density).fill(null) as Individual[];
            let j = 0;
            for (let i = 0; i < length; i++) {
                if (i == center) continue;
                if (selected[i]) continue;
                if (matrix[center][i] < min_avg) {
                    selected[i] = true;
                    cluster[j] = population[i];
                    j++;
                }
            }
            let specie = new Species(population[center], this.config)
            specie.population = cluster;
            this.species.push(specie);
    
            remaining -= cluster.length;

        } while (remaining > 0);
    }

    AfterSort(population: Individual[]): void {
        
    }  

}