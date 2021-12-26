import * as readline from 'readline';

/**
 * Returns colored string
 */ 
export function Colored(msg: string, color?: string) {
    if (!color) return msg;
    color = {
        black: '0;30',
        red: '0;31',
        green: '0;32',
        brown: '0;33',
        blue: '0;34',
        purple: '0;35',
        cyan: '0;36',
        lightgray: '0;37',
        darkgray: '1;30',
        lightred: '1;31',
        lightgreen: '1;32',
        yellow: '1;33',
        lightblue: '1;34',
        lightpurple: '1;35',
        lightcyan: '1;36'
    }[color] || ''
    return '\x1B[' + color + 'm' + msg + '\x1B[0m'
}

/**
 * Returns colored header
 */
export function Header(title?: string): string {
    const version = require('../../../package.json').version;
    return Colored(' __    __     ______     __   __     ______     ______     ______  \n', 'lightpurple')+
    Colored('/\\ "-./  \\   /\\  __ \\   /\\ "-.\\ \\   /\\  ___\\   /\\  __ \\   /\\__  _\\ \n', 'lightblue')+
    Colored('\\ \\ \\-./\\ \\  \\ \\ \\/\\ \\  \\ \\ \\-.  \\  \\ \\  __\\   \\ \\  __ \\  \\/_/\\ \\/ \n', 'lightcyan')+
    Colored(' \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\ \\_\\\\"\\_\\  \\ \\_____\\  \\ \\_\\ \\_\\    \\ \\_\\ \n', 'lightgreen')+
    Colored('  \\/_/  \\/_/   \\/_____/   \\/_/ \\/_/   \\/_____/   \\/_/\\/_/     \\/_/ \n', 'yellow') +
    `                                                            v${version}\n`+
    (title?(
        Colored(`#  ${title}  #\n`, 'lightpurple')
    ):'')
}
/*
 * Returns colored quote
 */
export function Quote(quote: string): string {

    let lines = quote.split('\n');
    let pad = (str:string) => (str+'                                                              ').slice(0,62);

    let str = '';
    lines.map(line => {
        while (line.length > 0) {
            let l = line.slice(0,62);
            str += Colored('| ' + pad(l) + ' |', 'lightgray') + '\n';
            line = line.slice(62);
        }
    })

    return str;
}

/*
 * Ask a question and wait for the answer
 */
export async function Question(text: string, defaul='', prefix=''): Promise<string> {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(Colored(text + ' ', 'cyan')+prefix, val => {
            if (!val.length) return;
            rl.close();
            resolve(val);
        })
        rl.write(defaul);
    })
}