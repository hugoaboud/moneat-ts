import { Activation } from "../src/Activation";
import { IGenomeConfig } from "../src/Genome";
import { DefaultGenomeConfig, DefaultMONEATConfig, DefaultAttributeConfig } from "../src/util/Defaults";
import { DeepPartial, Merge } from "../src/util/Config";
import { IMONEATConfig } from "../src/MONEAT";
import { IAttributeConfig } from "../src/Attribute";

export const Genome = (config?: DeepPartial<IGenomeConfig>) => Merge(DefaultGenomeConfig({
    
    inputs: 3,
    outputs: 3,

    bias: DefaultAttributeConfig(),
    weight: DefaultAttributeConfig(),
    mult: DefaultAttributeConfig(),
    
    activation: {
        hidden: [Activation.Linear],
        output: [Activation.Linear]
    },
    
    recurrent: true
    
}), config);

export const Attribute = (config?: DeepPartial<IAttributeConfig>) => Merge(DefaultAttributeConfig(), config);

export const MONEAT = (config?: DeepPartial<IMONEATConfig>) => Merge(DefaultMONEATConfig({

}), config);