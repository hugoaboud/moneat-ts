import { Activation } from "../src/Activation";

const Input = [-999,-99,-9,-1,-0.5,-0.1,0,0.1,0.5,1,9,99,999];

describe('Functions', () => {

    test('Linear',() => { 
        let output = Input.map(i => Activation.Linear(i));
        expect(output).toEqual(Input);
    });

    test('Clamped',() => { 
        let expected = [-1,-1,-1,-1,-0.5,-0.1,0,0.1,0.5,1,1,1,1]
        let output = Input.map(i => Activation.Clamped(i));
        expect(output).toEqual(expected);
    });

    test('Sigmoid',() => { 
        let expected = [0,0,0,0.006,0.075,0.377,0.5,0.622,0.924,0.993,1,1,1]
        let output = Input.map(i => Activation.Sigmoid(i));
        output.forEach((o,i) => {
            expect(o).toBeCloseTo(expected[i]);
        })
    });
    

})