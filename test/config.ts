import { Activation } from "../src/Activation";
import { IGenomeConfig, IMutableParamConfig } from "../src/Genome";
import { DefaultMutableParamConfig } from "../src/util/Defaults";
import { DeepPartial, Merge } from "../src/util/TestConfig";

export const Genome = (config?: DeepPartial<IGenomeConfig>) => Merge({
    
    bias: DefaultMutableParamConfig(),
    weight: DefaultMutableParamConfig(),
    mult: DefaultMutableParamConfig(),
    activation: {
        hidden: [Activation.Linear],
        output: [Activation.Linear]
    },
    recurrent: false
    
}, config);

export const MutableParam = (config?: DeepPartial<IMutableParamConfig>) => Merge({
    ...DefaultMutableParamConfig()
}, config);