import { Activation } from "../src/Activation";
import { IGenomeConfig, IMutableParamConfig } from "../src/Genome";
import { DefaultGenomeConfig, DefaultMONEATConfig, DefaultMutableParamConfig } from "../src/util/Defaults";
import { DeepPartial, Merge } from "../src/util/Config";
import { IMONEATConfig } from "../src/MONEAT";

export const Genome = (config?: DeepPartial<IGenomeConfig>) => Merge(DefaultGenomeConfig({
    
    inputs: 3,
    outputs: 3,

    bias: DefaultMutableParamConfig(),
    weight: DefaultMutableParamConfig(),
    mult: DefaultMutableParamConfig(),
    
    activation: {
        hidden: [Activation.Linear],
        output: [Activation.Linear]
    },
    
    recurrent: true
    
}), config);

export const MutableParam = (config?: DeepPartial<IMutableParamConfig>) => Merge(DefaultMutableParamConfig(), config);

export const MONEAT = (config?: DeepPartial<IMONEATConfig>) => Merge(DefaultMONEATConfig({

}), config);