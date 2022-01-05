import { Colored, Header, Question, Quote } from "./String";

let quote = Quote("Welcome to MONEAT!\n"+
            "This is a free and open-source project I've created to study  the interaction between NEAT and other AI strategies.\n"+
            "You are free to use it for any purpose, but please keep two   things in mind:\n"+
            "  - Being ethical is an active process. Study and discuss,    don't relay on inate ethics.\n"+
            "  - If this tools helps you achieve a financial goal, considerdonating.")

interface PageOption {
    name: string,
    callback: () => Promise<void>
}

async function PressAnyKeyToContinue(): Promise<void> {
    console.log('\nPress any key to continue...');
    process.stdin.setRawMode(true)
    process.stdin.resume()
    return new Promise(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false)
        resolve();
    }))
}

async function Page(title: string, options: Record<string,PageOption>, color: string, main = false) {

    while (true) {

        console.clear();
        console.log(Header(title));
        if (main) console.log(quote);

        Object.keys(options).map(o => {
            console.log(Colored(`[${o}] ${options[o].name}`, color));
        })
        if (main) console.log(Colored(`[q] Quit`, color));
        else console.log(Colored(`[<] Back`, color));
        
        console.log()
        let option = await Question('Choose an option:');
        if ((main && option === 'q') || (!main && option === '<')) {
            return;
        }

        if (!options[option]) {
            console.log(Colored('Invalid option.', 'red'));
            await PressAnyKeyToContinue();
            continue;
        }
        
        await options[option].callback();
        if (!main) await PressAnyKeyToContinue();
    }
}

async function Main() {
    return Page('Command Line Interface', {
        'e': {
            name: 'Examples',
            callback: async () => Examples()
        }
    }, 'lightgreen', true)
}

async function Examples() {
    return Page('Examples', {
        '1': {
            name: 'XOR',
            callback: async () => {
                require('../../examples/xor/xor')
            }
        }
    }, 'lightblue')
}

Main();