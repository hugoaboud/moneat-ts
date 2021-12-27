import { Activation } from "../src/Activation";
import { IGenomeConfig } from "../src/Genome";
import { DefaultGenomeConfig, DefaultMONEATConfig, DefaultNumericAttributeConfig } from "../src/util/Defaults";
import { DeepPartial, Merge } from "../src/util/Config";
import { IMONEATConfig } from "../src/MONEAT";
import { INumericAttributeConfig } from "../src/Attribute";

export const Genome = (config?: DeepPartial<IGenomeConfig>) => Merge(DefaultGenomeConfig({
    
    inputs: 3,
    outputs: 3,

    bias: DefaultNumericAttributeConfig(),
    weight: DefaultNumericAttributeConfig(),
    mult: DefaultNumericAttributeConfig(),
    
    activation: {
        hidden: [Activation.Linear],
        output: [Activation.Linear]
    },
    
    recurrent: true
    
}), config);

export const Attribute = (config?: DeepPartial<INumericAttributeConfig>) => Merge(DefaultNumericAttributeConfig(), config);

export const MONEAT = (config?: DeepPartial<IMONEATConfig>) => Merge(DefaultMONEATConfig({

}), config);