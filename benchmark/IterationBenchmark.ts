import { Header } from "../src/cli/string";
import { TrackTime } from "../src/util/Benchmark";

console.log(Header('Benchmark: Iteration'))

const N = 100000;
const RUNS = 1000;

const Data = Array(N).fill(1);

TrackTime('for', () => {
    let a = 0;
    for (let i = 0; i < N; i++) a += Data[i];
}, RUNS);
console.log();

TrackTime('for in', () => {
    let a = 0;
    for (let i in Data) a += Data[i];
}, RUNS);
console.log();

TrackTime('Array.map', () => {
    let a = 0;
    Data.map(d => a += d);
}, RUNS);
console.log();

