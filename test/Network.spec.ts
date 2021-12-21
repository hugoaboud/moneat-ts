import { Genome } from "../src/Genome";
import { Genome as GenomeConfig } from "./config";

describe('Build from Genome', () => {

    test('just tryin some stuff', async () => {
        
        let genome = new Genome(GenomeConfig(), 1, 1);

        return expect(0).toBe(1);
    });

})