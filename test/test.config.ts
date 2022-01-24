import { Activation } from "../src/Activation";
import { IGenomeConfig } from "../src/Genome";
import { DefaultBooleanAttributeConfig, DefaultGenomeConfig, DefaultMONEATConfig, DefaultNumericAttributeConfig } from "../src/Defaults";
import { DeepPartial, Merge } from "../src/util/Config";
import { IMONEATConfig } from "../src/MONEAT";
import { IBooleanAttributeConfig, INumericAttributeConfig } from "../src/Attribute";

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
    
    feedforward: true
    
}), config);

export const NumericAttribute = (config?: DeepPartial<INumericAttributeConfig>) => Merge(DefaultNumericAttributeConfig(), config);
export const BooleanAttribute = (config?: DeepPartial<IBooleanAttributeConfig>) => Merge(DefaultBooleanAttributeConfig(), config);

export const MONEAT = (config?: DeepPartial<IMONEATConfig>) => Merge(DefaultMONEATConfig({

}), config);