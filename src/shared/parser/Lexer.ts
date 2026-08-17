import { Token, KEYWORDS } from "./Token";

export interface LexError {
    message: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
}

export interface LexResult {
    tokens: Token[];
    errors: LexError[];
}

const PUNCTUATORS_2 = [
    "==", "!=", "<>", "<=", ">=", "&&", "||", "^^", "<<", ">>",
    "+=", "-=", "*=", "/="
];

const PUNCTUATORS_1 = new Set(
    "+-*/%=<>!&|^~(){}[],.;:".split("")
);

function isDigit(ch: string): boolean {
    return ch >= "0" && ch <= "9";
}

function isIdentStart(ch: string): boolean {
    return /[A-Za-z_]/.test(ch);
}

function isIdentPart(ch: string): boolean {
    return /[A-Za-z0-9_]/.test(ch);
}

/** Turns Crusade script source text into a flat token stream for the Parser. */
export class Lexer {

    private pos = 0;
    private line = 0;
    private column = 0;
    private readonly errors: LexError[] = [];

    constructor(private readonly text: string) {}

    /** Tokenizes the whole source, always ending with an EOF token. Lexical errors (bad characters, unterminated strings/comments) are collected rather than thrown, so tokenizing never aborts early. */
    public tokenize(): LexResult {

        const tokens: Token[] = [];

        for (;;) {
            this.skipWhitespaceAndComments();
            if (this.isAtEnd()) break;

            const token = this.readToken();
            if (token) tokens.push(token);
        }

        tokens.push({
            type: "EOF",
            value: "",
            line: this.line,
            column: this.column,
            endLine: this.line,
            endColumn: this.column
        });

        return { tokens, errors: this.errors };

    }

    /** Whether the cursor has consumed the entire source text. */
    private isAtEnd(): boolean {
        return this.pos >= this.text.length;
    }

    /** Looks at a character ahead of the cursor without consuming it; "\0" past the end of the text. */
    private peek(offset = 0): string {
        const i = this.pos + offset;
        return i < this.text.length ? this.text[i] : "\0";
    }

    /** Consumes and returns the current character, updating line/column bookkeeping. */
    private advance(): string {

        const ch = this.text[this.pos++];

        if (ch === "\n") {
            this.line += 1;
            this.column = 0;
        } else {
            this.column += 1;
        }

        return ch;

    }

    /** Advances past whitespace, "//" line comments and "/* *\/" block comments; reports an unterminated block comment that never finds its closing "*\/". */
    private skipWhitespaceAndComments(): void {

        for (;;) {

            const ch = this.peek();

            if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
                this.advance();
                continue;
            }

            if (ch === "/" && this.peek(1) === "/") {
                while (!this.isAtEnd() && this.peek() !== "\n") this.advance();
                continue;
            }

            if (ch === "/" && this.peek(1) === "*") {

                const startLine = this.line;
                const startColumn = this.column;

                this.advance();
                this.advance();

                while (!this.isAtEnd() && !(this.peek() === "*" && this.peek(1) === "/")) {
                    this.advance();
                }

                if (this.isAtEnd()) {
                    this.errors.push({
                        message: "Unterminated block comment",
                        line: startLine,
                        column: startColumn,
                        endLine: this.line,
                        endColumn: this.column
                    });
                    return;
                }

                this.advance();
                this.advance();
                continue;

            }

            break;

        }

    }

    /** Reads exactly one token starting at the cursor (number, string, identifier/keyword, or punctuator). Returns null for a bad character, which is recorded as an error rather than a token. */
    private readToken(): Token | null {

        const startLine = this.line;
        const startColumn = this.column;
        const ch = this.peek();

        if (isDigit(ch) || (ch === "." && isDigit(this.peek(1)))) {
            return this.readNumber(startLine, startColumn);
        }

        if (ch === "\"" || ch === "'") {
            return this.readString(startLine, startColumn, ch);
        }

        if (isIdentStart(ch)) {
            return this.readIdentifier(startLine, startColumn);
        }

        const two = ch + this.peek(1);
        if (PUNCTUATORS_2.includes(two)) {
            this.advance();
            this.advance();
            return this.makeToken("Punctuator", two, startLine, startColumn);
        }

        if (PUNCTUATORS_1.has(ch)) {
            this.advance();
            return this.makeToken("Punctuator", ch, startLine, startColumn);
        }

        this.advance();
        this.errors.push({
            message: `Unexpected character '${ch}'`,
            line: startLine,
            column: startColumn,
            endLine: this.line,
            endColumn: this.column
        });

        return null;

    }

    /** Reads an integer or decimal literal (e.g. "12", "0.5", ".5"). */
    private readNumber(startLine: number, startColumn: number): Token {

        let value = "";

        while (isDigit(this.peek())) value += this.advance();

        if (this.peek() === "." && isDigit(this.peek(1))) {
            value += this.advance();
            while (isDigit(this.peek())) value += this.advance();
        }

        return this.makeToken("Number", value, startLine, startColumn);

    }

    /** Reads a single- or double-quoted string literal. */
    private readString(startLine: number, startColumn: number, quote: string): Token {

        let value = "";
        this.advance();

        // GM8 string literals may contain literal newlines (scripts routinely
        // embed multi-line text this way) — only true EOF makes one unterminated.
        while (!this.isAtEnd() && this.peek() !== quote) {
            value += this.advance();
        }

        if (this.peek() !== quote) {
            this.errors.push({
                message: "Unterminated string literal",
                line: startLine,
                column: startColumn,
                endLine: this.line,
                endColumn: this.column
            });
            return this.makeToken("String", value, startLine, startColumn);
        }

        this.advance();

        return this.makeToken("String", value, startLine, startColumn);

    }

    /** Reads an identifier and classifies it as a Keyword or Identifier token depending on the KEYWORDS set. */
    private readIdentifier(startLine: number, startColumn: number): Token {

        let value = "";

        while (isIdentPart(this.peek())) value += this.advance();

        return this.makeToken(
            KEYWORDS.has(value) ? "Keyword" : "Identifier",
            value,
            startLine,
            startColumn
        );

    }

    /** Builds a token spanning from (startLine, startColumn) to the lexer's current position. */
    private makeToken(
        type: Token["type"],
        value: string,
        startLine: number,
        startColumn: number
    ): Token {
        return {
            type,
            value,
            line: startLine,
            column: startColumn,
            endLine: this.line,
            endColumn: this.column
        };
    }

}
