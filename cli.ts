import { Colored, Header, Question, Quote } from "./src/cli/String";



console.log(Header("Command Line Interface"));

console.log(Quote("Welcome to MONEAT!\n"+
            "This is a free and open-source project I've created to study  the interaction between NEAT and other AI strategies.\n"+
            "You are free to use it for any purpose, but please keep two   things in mind:\n"+
            "  - Being ethical is an active process. Study and discuss,    don't relay on inate ethics.\n"+
            "  - If this tools helps you achieve a financial goal, considerdonating."))

interface PageOption {
    name: string,
    callback: () => Promise<void>
}

async function Page(options: Record<string,PageOption>, color: string, main = false) {
    while (true) {

        Object.keys(options).map(o => {
            console.log(Colored(`[${o}] ${options[o].name}`, color));
        })
        if (main) console.log(Colored(`[q] Quit`, color));
        else console.log(Colored(`[<] Back`, color));
        
        console.log()
        let option = await Question('Choose an option:');
        if ((main && option === 'q') || (!main && option === '<')) return;

        if (!options[option]) {
            console.log(Colored('Invalid option.\n', 'red'));
            continue;
        }
        
        await options[option].callback();
    }
}

async function Main() {
    return Page({
        'e': {
            name: 'Examples',
            callback: async () => Examples()
        }
    }, 'lightgreen', true)
}

async function Examples() {
    return Page({
        '1': {
            name: 'XOR',
            callback: async () => {
                require('./examples/xor/xor')
            }
        }
    }, 'lightblue')
}

Main();