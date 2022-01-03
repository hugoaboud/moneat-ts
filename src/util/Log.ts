import { Colored } from "../cli/String";
import { Genome } from "../Genome";
import { Exception } from "./Exception";

export enum LogLevel {
    ERROR,
    INFO,
    DETAIL,
    DEBUG
};

const LogColor = {
    [LogLevel.ERROR]: 'red',
    [LogLevel.INFO]: 'yellow',
    [LogLevel.DETAIL]: 'lightred',
    [LogLevel.DEBUG]: 'lightpurple'
}

function LevelString(level: LogLevel) {
    if (level === LogLevel.INFO) return 'INFO ';
    return LogLevel[level];
}


export default class Log {
    
    static Level = LogLevel.INFO

    static Data(domain: object, alias: string, data: any, level: LogLevel) {
        if (level > this.Level) return;
            
        let origin = domain.constructor.name;
        if (origin === 'Genome' || origin === 'NN_Walker') origin  += Colored(' ' + (domain as any).id, 'lightblue');

        console.log(
            Colored(LevelString(level), LogColor[level]) + ' ' +
            Colored(origin, 'lightcyan') + '.' +
            Colored(alias, 'lightpurple') + ': ' +
            JSON.stringify(data)
        )
    }
    
    static Method(domain: object, alias: string, inout: string, level: LogLevel) {
        if (level > this.Level) return;
        
        let origin = domain.constructor.name;
        if (origin === 'Genome' || origin === 'NN_Walker') origin  += Colored(' ' + (domain as any).id, 'lightblue');
        
        console.log(
            Colored(LevelString(level), LogColor[level]) + ' ' +
            Colored(origin, 'lightcyan') + '.' +
            Colored(alias, 'lightgreen') + ': ' +
            inout
        )
    
    }
    
    static Exception(e: Exception, level: LogLevel) {
        if (level > this.Level) return;
                
        console.log(
            Colored(LevelString(level), LogColor[level]) + ' ' +
            Colored(e.name, 'lightcyan') + '.' +
            e.message
        )
    
    }
    
    static Genome(genome: Genome) {
        let nodes = genome.getNodes();
        let conns = genome.getConns();
    
        console.log(Colored('Genome ', 'lightcyan') + Colored((genome as any).id, 'lightblue'));
        
        console.log(Colored('-nodes:', 'lightgray'));
        Object.keys(nodes).map((k,i) => {
            let node = nodes[k as any];
            let color = {
                input: 'blue',
                hidden: 'green',
                output: 'purple'
            }[node.type];
            console.log(
                Colored(`\t${(i+'  ').slice(0,3)} `, color) +
                Colored(`\t${(node.id+'  ').slice(0,3)} `, color) +
                Colored(`${(node.type + ' ').slice(0,6)} `, color) +
                (node.actv?.name || ''+'        ').slice(0,19) + ' ' +
                (node.bias?((Colored('b:','darkgray') + node.bias.value.toFixed(3)+'      ').slice(0,19)):'        ') + ' ' +
                (node.mult?((Colored('m:','darkgray') + node.mult.value.toFixed(3)+'      ').slice(0,19)):'        ') + ' '
            )
        })
        
        console.log(Colored('-connections:', 'lightgray'));
        conns.map((conn,i) => {
            let in_node = nodes[conn.in_node];
            let out_node = nodes[conn.out_node];
            let color_in = {
                input: 'blue',
                hidden: 'green',
                output: 'purple'
            }[in_node.type];
            let color_out = {
                input: 'blue',
                hidden: 'green',
                output: 'purple'
            }[out_node.type];
            let color = null as any;
            if (!conn.enabled.value) {
                color = 'darkgray';
            }
            console.log(
                Colored(`\t${(conn.id+'   ').slice(0,4)} `, color || 'lightblue') +
                Colored(`${(conn.in_node+'  ').slice(0,3)} `, color || color_in) +
                Colored(' -> ', color) +
                Colored(`${(conn.out_node+'  ').slice(0,3)} `, color || color_out) + 
                Colored('w:','darkgray') + Colored(conn.weight.value.toFixed(3), color)
            )
        })
    }

}