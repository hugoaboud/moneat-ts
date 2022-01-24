// import { Genome } from "../src/Genome";
// import MONEAT from "../src/MONEAT";
// import * as Config from "./test.config";

// describe('Constructor', () => {

//     test('Should fail for population <= 0', async () => {
//         expect(() => {
//             new MONEAT(Config.MONEAT({
//                 population: 0
//             }))
//         }).toThrow('E_MONEAT: (config) Population size should be greater than 0')
//     });

// })

// describe('Reset', () => {

//     test('Should create population of genomes with configured size', async () => {
//         let moneat = new MONEAT(Config.MONEAT({
//             population: 42
//         }));
//         expect(moneat.getPopulation()).toHaveLength(42);
//     });

//     test('Should create network and reset fitness for individual', async () => {
//         let moneat = new MONEAT(Config.MONEAT({
//             population: 42
//         }));
//         moneat.getPopulation().map(ind => {
//             expect(ind.network).toBeNull();
//             moneat.ResetIndividual(ind);
//             expect(ind.network).not.toBeNull();
//             expect(ind.fitness).toHaveLength(0);
//         })
//     });

// })

// describe('Compatibility Distance', () => {

//     test('Should be 0 for empty genomes', async () => {
//         let moneat = new MONEAT(Config.MONEAT({
//             population: 2
//         }))
//         let a = moneat.getPopulation()[0].genome;
//         let b = moneat.getPopulation()[1].genome;
//         //let dist = moneat.CompatibilityDistance(a, b);
//         let dist = 999;
//         expect(dist).toEqual(0);
//     });

//     test('Should be 0 for clone', async () => {
//         let moneat = new MONEAT(Config.MONEAT({
//             population: 1
//         }))
//         let genome = moneat.getPopulation()[0].genome;
//         let clone = genome.Clone();
//         //let dist = moneat.CompatibilityDistance(genome, clone);
//         let dist = 999;
//         expect(dist).toEqual(0);
//     });

//     test.skip('Should take excess nodes into account', async () => {
        
//     });

//     test.skip('Should take excess coefficient into account', async () => {
        
//     });

//     test.skip('Should take excess into account', async () => {
        
//     });

//     test.skip('Should take disjoint coefficient into account', async () => {
        
//     });

//     test.skip('Should take total weight difference into account', async () => {
        
//     });

//     test.skip('Weight of disabled gene should be 0 on difference calculation', async () => {
        
//     });

//     test.skip('Should take weight coefficient into account', async () => {
        
//     });

// })

// describe('Speciate', () => {

// })

// describe('Evolve', () => {

//     test.skip('Should calculate single fitness for each individual', async () => {
        
//     });

//     test.skip('Should calculate multiple fitnesses for each individual', async () => {
        
//     });

//     test.skip('Should skip evolution for last epoch', async () => {
        
//     });

// })