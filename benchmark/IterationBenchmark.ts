import { Header } from "../src/cli/String";
import { TrackTime } from "../src/util/Benchmark";

/*
    Benchmark: Iteration

    Supports a design decision of using 'for' instead of 'map'
    on performance-sensitive methods.

*/

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

TrackTime('Array.reduce', () => {
    Data.reduce((a,d) => a += d, 0);
}, RUNS);
console.log();

