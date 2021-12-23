import {isString} from "../typing/guards";
import EventEmitter from "events";

type ExecOptions = {
    cwd?: string,

}

function formatArgs(args: Array<string>, freeform?: string): string | null {
    const formattedArgs = [];

    // Freeform arg should come first
    if (isString(freeform)) {
        formattedArgs.push(freeform);
    }

    // Only then structured args
    if (args.length > 0) {
        for (const key in args) {
            const value = args[key];
            const keyValue = key + "=" + value;
            formattedArgs.push(keyValue);
        }
    }

    if (formattedArgs.length > 0) {
        return formattedArgs.join(" ");
    }

    return null;
}

export {}
/*export class AbstractAnsibleCommands extends EventEmitter {
    exec(options: any)
}*/
