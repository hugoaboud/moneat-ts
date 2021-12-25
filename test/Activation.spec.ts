import { Activation } from "../src/Activation";
import { Genome } from "../src/Genome";
import { Genome as GenomeConfig } from "./config";

describe('Linear', () => {

    test('-999 => -999',() => { expect(Activation.Linear(-999)).toBe(-999) });
    test('-1   => -1'  ,() => { expect(Activation.Linear(-1  )).toBe(-1  ) });
    test('-0.5 => -0.5',() => { expect(Activation.Linear(-0.5)).toBe(-0.5) });
    test('-0.1 => -0.1',() => { expect(Activation.Linear(-0.1)).toBe(-0.1) });
    test('0    => 0'   ,() => { expect(Activation.Linear(0   )).toBe(0   ) });
    test('0.1  => 0.1' ,() => { expect(Activation.Linear(0.1 )).toBe(0.1 ) });
    test('0.5  => 0.5' ,() => { expect(Activation.Linear(0.5 )).toBe(0.5 ) });
    test('1    => 1'   ,() => { expect(Activation.Linear(1   )).toBe(1   ) });
    test('999  => 999' ,() => { expect(Activation.Linear(999 )).toBe(999 ) });

})

describe('Clamped', () => {

    test('-999 => -1'  ,() => { expect(Activation.Clamped(-999)).toBe(-1) });
    test('-1   => -1'  ,() => { expect(Activation.Clamped(-1  )).toBe(-1  ) });
    test('-0.5 => -0.5',() => { expect(Activation.Clamped(-0.5)).toBe(-0.5) });
    test('-0.1 => -0.1',() => { expect(Activation.Clamped(-0.1)).toBe(-0.1) });
    test('0    => 0'   ,() => { expect(Activation.Clamped(0   )).toBe(0   ) });
    test('0.1  => 0.1' ,() => { expect(Activation.Clamped(0.1 )).toBe(0.1 ) });
    test('0.5 => 0.5'  ,() => { expect(Activation.Clamped(0.5 )).toBe(0.5) });
    test('1    => 1'   ,() => { expect(Activation.Clamped(1   )).toBe(1   ) });
    test('999  => 1'   ,() => { expect(Activation.Clamped(999 )).toBe(1 ) });

})
