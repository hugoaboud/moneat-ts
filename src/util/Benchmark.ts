import { Colored } from "../cli/string";

export function TrackTime(title: string, fn: () => void, runs: number): void {

    console.log(Colored('TrackTime ', 'lightcyan') + Colored(title, 'lightblue'));

    let results = Array.from({length: runs}, () => {
        let s = new Date().getTime();
        fn();
        return new Date().getTime() - s;
    })

    let total = results.reduce((a,x) => a += x, 0);
    let avg = total/runs;
    let stdev = Math.sqrt(results.reduce((a,x) => a += Math.pow(x-avg, 2), 0)/runs)

    console.log(Colored(`\tRuns: `, 'lightgray') + runs);
    console.log(Colored(`\tAvg. Time (ms): `, 'lightgray') + avg);
    console.log(Colored(`\tTotal Time (ms): `, 'lightgray') + total);
    console.log(Colored(`\tStd. Dev: `, 'lightgray') + stdev.toFixed(3));
}
