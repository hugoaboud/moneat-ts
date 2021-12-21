/**
 * Returns colored string
 */ 
export function Colored(msg: string, color: string) {
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