import { Genome } from "../src/Genome";
import MONEAT from "../src/MONEAT";
import { Speciation } from "../src/Speciation";
import * as Config from "./test.config";

describe('Constructor', () => {

    test('Should fail for population <= 0', async () => {
        expect(() => {
            new MONEAT(Config.MONEAT({
                population: 0
            }))
        }).toThrow('E_MONEAT: (config) Population size should be greater than 0')
    });

})

describe('Reset', () => {

    test('Should create population of genomes with configured size', async () => {
        let moneat = new MONEAT(Config.MONEAT({
            population: 42
        }));
        expect(moneat.getPopulation()).toHaveLength(42);
    });

    test('Should speciate population', async () => {
        let moneat = new MONEAT(Config.MONEAT({
            population: 42
        }));
        let species = moneat.getSpecies();
        expect(species.length).toBeGreaterThan(0);
        let pop = species.reduce((a,x) => a + x.population.length, 0);
        expect(pop).toEqual(42);
    });

    test('ResetIndividual: Should create network and reset fitness for individual', async () => {
        let moneat = new MONEAT(Config.MONEAT({
            population: 42
        }));
        moneat.getPopulation().map(ind => {
            expect(ind.network).toBeNull();
            moneat.ResetIndividual(ind);
            expect(ind.network).not.toBeNull();
            expect(ind.fitness).toHaveLength(0);
        })
    });

})

describe('Evolve', () => {

    test.skip('Should calculate single fitness for each individual', async () => {
        
    });

    test.skip('Should calculate multiple fitnesses for each individual', async () => {
        
    });

    test.skip('Should skip evolution for last epoch', async () => {
        
    });

})