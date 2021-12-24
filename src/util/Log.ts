import { Colored } from "../cli/string";
import { Genome } from "../Genome";

export enum LogLevel {
    ERROR,
    INFO,
    DEBUG
};

const LogColor = {
    [LogLevel.ERROR]: 'red',
    [LogLevel.INFO]: 'yellow',
    [LogLevel.DEBUG]: 'lightpurple'
}

export default class Log {
    
    static Level = LogLevel.DEBUG

    static Data(domain: object, alias: string, data: any, level: LogLevel) {
        if (level > this.Level) return;
            
        let origin = domain.constructor.name;
        if (origin === 'Genome' || origin === 'NN_Walker') origin  += Colored(' ' + (domain as any).id, 'lightblue');

        console.log(
            Colored(LogLevel[level], LogColor[level]) + ' ' +
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
            Colored(LogLevel[level], LogColor[level]) + ' ' +
            Colored(origin, 'lightcyan') + '.' +
            Colored(alias, 'lightgreen') + ': ' +
            inout
        )
    
    }
    
    static Genome(genome: Genome) {
        let nodes = genome.getNodes();
        let conns = genome.getConns();
    
        console.log(Colored('Genome ', 'lightcyan') + Colored((genome as any).id, 'lightblue'));
        
        console.log(Colored('-nodes:', 'lightgray'));
        nodes.map((node,i) => {
            let color = {
                input: 'blue',
                hidden: 'green',
                output: 'purple'
            }[node.type];
            console.log(
                Colored(`\t${(i+'  ').slice(0,3)} `, color) +
                Colored(`\t${(node.id+'  ').slice(0,3)} `, color) +
                Colored(`${(node.type + ' ').slice(0,6)} `, color) +
                (node.activation?.name || ''+'        ').slice(0,19) + ' ' +
                (node.bias?((Colored('b:','darkgray') + node.bias.value.toFixed(3)+'      ').slice(0,19)):'        ') + ' ' +
                (node.mult?((Colored('m:','darkgray') + node.mult.value.toFixed(3)+'      ').slice(0,19)):'        ') + ' '
            )
        })
        
        console.log(Colored('-connections:', 'lightgray'));
        conns.map((conn,i) => {
            let color_in = {
                input: 'blue',
                hidden: 'green',
                output: 'purple'
            }[conn.in_node.type];
            let color_out = {
                input: 'blue',
                hidden: 'green',
                output: 'purple'
            }[conn.out_node.type];
            let color = null as any;
            if (!conn.enabled) {
                color = 'darkgray';
            }
            let i_in = nodes.indexOf(conn.in_node);
            let i_out = nodes.indexOf(conn.out_node);
            console.log(
                Colored(`\t${(conn.innovation+'   ').slice(0,4)} `, color || 'lightblue') +
                Colored(`${(i_in+'  ').slice(0,3)} `, color || color_in) +
                Colored(' -> ', color) +
                Colored(`${(i_out+'  ').slice(0,3)} `, color || color_out) + 
                Colored('w:','darkgray') + Colored(conn.weight.value.toFixed(3), color)
            )
        })
    }

}