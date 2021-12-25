import { Colored } from "../cli/String";

export function TrackTime(title: string, fn: (i: number) => void, runs: number): void {

    console.log(Colored('TrackTime ', 'lightcyan') + Colored(title, 'lightblue'));
    console.log(Colored(`\tRuns: `, 'lightgray') + runs);
    
    let i = 0;
    let results = Array.from({length: runs}, () => {
        let s = new Date().getTime();
        fn(i++);
        return new Date().getTime() - s;
    })

    let total = results.reduce((a,x) => a += x, 0);
    let avg = total/runs;
    let stdev = Math.sqrt(results.reduce((a,x) => a += Math.pow(x-avg, 2), 0)/runs)

    console.log(Colored(`\tAvg. Time (ms): `, 'lightgray') + avg);
    console.log(Colored(`\tTotal Time (s): `, 'lightgray') + (total/1000.0).toFixed(3));
    console.log(Colored(`\tStd. Dev: `, 'lightgray') + stdev.toFixed(3));
}
