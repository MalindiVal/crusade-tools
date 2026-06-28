import { Program } from "./AST";
import { Token } from "./Token";

export class Parser {
    parse(tokens:Token[]):Program{
        return {
            kind:"Program",
            statements:[]
        };
    }
}
