export type TokenType =
    | "Number"
    | "String"
    | "Identifier"
    | "Keyword"
    | "Punctuator"
    | "EOF";

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
}

// Keywords recognized by the Crusade fighter/item/stage scripts (a GML 8
// dialect). "self"/"other"/"all"/"noone"/"global" behave as identifiers in
// expression position but are reserved words in GM8.
export const KEYWORDS: ReadonlySet<string> = new Set([
    "if", "then", "else", "while", "do", "until", "for", "repeat",
    "switch", "case", "default", "break", "continue", "return", "exit",
    "with", "var", "globalvar",
    "true", "false", "and", "or", "not", "xor", "div", "mod",
    "self", "other", "all", "noone", "global"
]);
