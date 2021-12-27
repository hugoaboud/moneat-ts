import { Activation } from "../src/Activation";
import { NumericAttribute } from "../src/Attribute";
import { Genome } from "../src/Genome";
import { DefaultNumericAttributeConfig } from "../src/util/Defaults";
import { Gaussian } from "../src/util/Random";
import { Attribute as Config } from "./config";

// https://stattrek.com/probability-distributions/normal.aspx
// "About 68% of the area under the curve falls within 1 standard deviation of the mean.""
function GaussianTest(mean: number, stdev: number) {
    let samples = 100000;
    let precision = 100;

    const gaussian = Gaussian(mean, stdev);
    let values = Array.from({length: samples}, () => gaussian());
    let ranges = values.map(v => Math.floor(v*precision)/precision);

    let peak = {
        value: 0,
        d: 0
    }
    let distribution = ranges.reduce((a:Record<string,number>,x) => {
        if (!(x in a)) a[x] = 0;
        a[x]++;
        if (a[x] > peak.d) {
            peak.value = x;
            peak.d = a[x];
        }
        return a;
    }, {})

    let stdev_area = Object.keys(distribution).reduce((a,x) => {
        let v = parseFloat(x);
        if (v < mean-stdev || v > mean+stdev) return a;
        a += distribution[x];
        return a;
    }, 0);

    expect(stdev_area/samples).toBeCloseTo(0.68,1);
    expect(peak.value).toBeCloseTo(mean,0);
}

describe('Gaussian', () => {

    test('Mean: 0, Stdev: 1', async () => {
        GaussianTest(0,1);
    });

    test('Mean: 0, Stdev: 2', async () => {
        GaussianTest(0,2);
    });

    test('Mean: 0, Stdev: 0.5', async () => {
        GaussianTest(0,0.5);
    });
    
    test('Mean: 1, Stdev: 1', async () => {
        GaussianTest(1,1);
    });

    test('Mean: 3, Stdev: 0.5', async () => {
        GaussianTest(3,0.5);
    });

})

describe('Mutation', () => {

    test('Should replace the value on mutation', () => {
        let param = new NumericAttribute(Config({
            mutation: {
                prob: {
                    offset: 0,
                    replace: 1
                }
            }
        }));
        let old_value = param.value;
        param.Mutate();
        expect(param.value).not.toEqual(old_value);
    })

    test('Should offset the value on mutation', () => {
        let config = Config({
            mutation: {
                prob: {
                    offset: 1,
                    replace: 0
                }
            }
        });
        let param = new NumericAttribute(config);
        let old_value = param.value;
        param.Mutate();
        let diff = Math.abs(param.value-old_value);

        expect(diff).toBeGreaterThan(0);
        expect(diff).toBeLessThan(config.mutation.rate);
    })

    test('Should run replace mutation according to probability', () => {
        let param = new NumericAttribute(Config({
            mutation: {
                prob: {
                    offset: 0,
                    replace: 0.2
                }
            }
        }));
        function mutate() {
            let old_value = param.value;
            param.Mutate();
            return param.value != old_value;
        }

        let steps = 10000;
        let mutations = 0;
        for (let i = 0; i < steps; i++) {
            if (mutate()) mutations++;
        }

        expect(mutations/steps).toBeCloseTo(0.2, 1);
    })

    test('Should run offset mutation according to probability', () => {
        let param = new NumericAttribute(Config({
            mutation: {
                prob: {
                    offset: 0.2,
                    replace: 0
                }
            }
        }));
        function mutate() {
            let old_value = param.value;
            param.Mutate();
            return param.value != old_value;
        }
        
        let steps = 10000;
        let mutations = 0;
        for (let i = 0; i < steps; i++) {
            if (mutate()) mutations++;
        }

        expect(mutations/steps).toBeCloseTo(0.2, 1);
    })

})