import { ConnInnovation, NodeInnovation } from "../src/Innovation";

beforeEach(() => {
    (NodeInnovation as any).last = -1;
    NodeInnovation.ResetCache();
    (ConnInnovation as any).last = -1;
    ConnInnovation.ResetCache();
})

describe('Node Innovation', () => {

    test('First innovation should be 0', async () => {
        expect(NodeInnovation.New(0,0)).toBe(0);
    });

    test('Should grow at each call', async () => {
        expect(NodeInnovation.New(0,0)).toBe(0);
        expect(NodeInnovation.New(0,1)).toBe(1);
    });

    test('Should keep cache of innovations', async () => {
        expect(NodeInnovation.New(0,0)).toBe(0);
        expect(NodeInnovation.New(0,1)).toBe(1);
        expect(NodeInnovation.New(0,0)).toBe(0);
        expect(NodeInnovation.New(0,1)).toBe(1);
        expect(NodeInnovation.New(0,2)).toBe(2);
    });

    test('Should reset cache of innovations', async () => {
        expect(NodeInnovation.New(0,0)).toBe(0);
        expect(NodeInnovation.New(0,1)).toBe(1);
        NodeInnovation.ResetCache();
        expect(NodeInnovation.New(0,0)).toBe(2);
        expect(NodeInnovation.New(0,1)).toBe(3);
        expect(NodeInnovation.New(0,2)).toBe(4);
    });

})

describe('Connection Innovation', () => {

    test('First innovation should be 0', async () => {
        expect(ConnInnovation.New(0,0)).toBe(0);
    });

    test('Should grow at each call', async () => {
        expect(ConnInnovation.New(0,0)).toBe(0);
        expect(ConnInnovation.New(0,1)).toBe(1);
    });

    test('Should keep cache of innovations', async () => {
        expect(ConnInnovation.New(0,0)).toBe(0);
        expect(ConnInnovation.New(0,1)).toBe(1);
        expect(ConnInnovation.New(0,0)).toBe(0);
        expect(ConnInnovation.New(0,1)).toBe(1);
        expect(ConnInnovation.New(0,2)).toBe(2);
    });

    test('Should reset cache of innovations', async () => {
        expect(ConnInnovation.New(0,0)).toBe(0);
        expect(ConnInnovation.New(0,1)).toBe(1);
        ConnInnovation.ResetCache();
        expect(ConnInnovation.New(0,0)).toBe(2);
        expect(ConnInnovation.New(0,1)).toBe(3);
        expect(ConnInnovation.New(0,2)).toBe(4);
    });

})

describe('Innovation Range', () => {

    

});