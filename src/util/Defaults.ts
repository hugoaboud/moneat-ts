import { IMutableParamConfig } from "../Genome";

export function DefaultMutableParamConfig(): IMutableParamConfig {
    return {
        min: -30,
        max: 30,
        init: {
            mean: 0,
            stdev: 1
        },
        mutation: {
            rate: 0.5,
            prob: {
                offset: 0.7,
                replace: 0.1
            }
        }
    }
}