import { Token, TokenType } from "./Token";
import * as AST from "./AST";

export interface ParseError {
    message: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
}

export interface ParseResult {
    program: AST.Program;
    errors: ParseError[];
}

const ASSIGNMENT_OPERATORS = new Set(["=", "+=", "-=", "*=", "/="]);

const STATEMENT_KEYWORDS = new Set([
    "if", "while", "do", "for", "repeat", "switch",
    "break", "continue", "return", "exit", "with", "var", "globalvar"
]);

// Binary operator precedence. A bare "=" is treated as equality here: real
// GM8 code writes `if state_type = "jump"` meaning `==`, reserving plain
// assignment for the statement-start position (see parseAssignmentOrExpression).
const PRECEDENCE: Record<string, number> = {
    "||": 1, "or": 1, "^^": 1,
    "&&": 2, "and": 2,
    "|": 3,
    "^": 4, "xor": 4,
    "&": 5,
    "==": 6, "!=": 6, "<>": 6, "=": 6,
    "<": 7, ">": 7, "<=": 7, ">=": 7,
    "<<": 8, ">>": 8,
    "+": 9, "-": 9,
    "*": 10, "/": 10, "%": 10, "div": 10, "mod": 10
};

/** Recursive-descent parser for Crusade scripts: turns a Lexer token stream into an AST.Program and a list of syntax errors, recovering after each error so one mistake doesn't stop the rest of the file from being checked. */
export class Parser {

    private pos = 0;
    private readonly errors: ParseError[] = [];

    private constructor(private readonly tokens: Token[]) {}

    /** Entry point: parses a full token stream and returns both the resulting AST and any syntax errors found along the way. */
    public static parse(tokens: Token[]): ParseResult {
        const parser = new Parser(tokens);
        const program = parser.parseProgram();
        return { program, errors: parser.errors };
    }

    // ---- token stream helpers ----------------------------------------

    /** The token at the current cursor position. */
    private current(): Token {
        return this.tokens[this.pos];
    }

    private isAtEnd(): boolean {
        return this.current().type === "EOF";
    }

    /** Whether the current token matches the given type (and, optionally, exact value) without consuming it. */
    private check(type: TokenType, value?: string): boolean {
        const token = this.current();
        if (token.type !== type) return false;
        return value === undefined || token.value === value;
    }

    /** Consumes and returns the current token, stopping at EOF. */
    private advance(): Token {
        const token = this.current();
        if (!this.isAtEnd()) this.pos += 1;
        return token;
    }

    /** Consumes the current token if it matches; returns whether it did. */
    private match(type: TokenType, value?: string): boolean {
        if (!this.check(type, value)) return false;
        this.advance();
        return true;
    }

    /** Consumes the current token if it matches, otherwise records a syntax error and leaves the cursor in place so the caller can attempt to recover. */
    private expect(type: TokenType, value: string, message: string): Token | null {
        if (this.check(type, value)) return this.advance();
        this.error(message, this.current());
        return null;
    }

    /** Records a syntax error spanning the given token. */
    private error(message: string, at: Token): void {
        this.errors.push({
            message,
            line: at.line,
            column: at.column,
            endLine: at.endLine,
            endColumn: at.endColumn
        });
    }

    /** Start position of a token, as an AST.Position. */
    private pos_(token: Token): AST.Position {
        return { line: token.line, column: token.column };
    }

    /** End position of a token, as an AST.Position. */
    private endPos_(token: Token): AST.Position {
        return { line: token.endLine, column: token.endColumn };
    }

    // Skips tokens until a likely statement boundary, so one syntax error
    // doesn't cascade into a wall of follow-on errors.
    private synchronize(): void {

        while (!this.isAtEnd()) {

            if (this.check("Punctuator", ";")) {
                this.advance();
                return;
            }

            if (this.check("Punctuator", "}")) return;

            if (this.check("Keyword") && STATEMENT_KEYWORDS.has(this.current().value)) {
                return;
            }

            this.advance();

        }

    }

    // ---- program / statements ------------------------------------------

    /** Parses the whole file as a flat list of top-level statements. */
    private parseProgram(): AST.Program {

        const start = this.pos_(this.current());
        const statements: AST.Statement[] = [];

        while (!this.isAtEnd()) {
            statements.push(this.parseStatement());
        }

        const end = this.endPos_(this.tokens[Math.max(0, this.pos - 1)]);

        return { kind: "Program", start, end, statements };

    }

    /** Dispatches on the current token to parse one statement of any kind, falling back to an expression statement. Catches any thrown error, records it, and resynchronizes so parsing can continue past it. */
    private parseStatement(): AST.Statement {

        try {

            if (this.check("Punctuator", "{")) return this.parseBlock();
            if (this.check("Punctuator", ";")) return this.parseEmpty();

            if (this.check("Keyword")) {

                switch (this.current().value) {
                    case "if": return this.parseIf();
                    case "while": return this.parseWhile();
                    case "do": return this.parseDoUntil();
                    case "for": return this.parseFor();
                    case "repeat": return this.parseRepeat();
                    case "switch": return this.parseSwitch();
                    case "with": return this.parseWith();
                    case "var": return this.parseVarDeclaration();
                    case "globalvar": return this.parseGlobalVarDeclaration();
                    case "break": return this.parseSimpleKeyword("BreakStatement");
                    case "continue": return this.parseSimpleKeyword("ContinueStatement");
                    case "exit": return this.parseSimpleKeyword("ExitStatement");
                    case "return": return this.parseReturn();
                    default: break;
                }

            }

            return this.parseExpressionStatement();

        } catch {

            const at = this.current();
            this.synchronize();
            return { kind: "ErrorStatement", start: this.pos_(at), end: this.endPos_(at) };

        }

    }

    /** GM8 doesn't require statement-terminating semicolons; consume one if present, otherwise do nothing. */
    private consumeOptionalSemicolon(): void {
        this.match("Punctuator", ";");
    }

    /** Parses a bare ";" with no statement before it. */
    private parseEmpty(): AST.EmptyStatement {
        const start = this.pos_(this.current());
        const token = this.advance();
        return { kind: "EmptyStatement", start, end: this.endPos_(token) };
    }

    /** Parses a "{ ... }" block of statements. */
    private parseBlock(): AST.BlockStatement {

        const open = this.advance();
        const body: AST.Statement[] = [];

        while (!this.isAtEnd() && !this.check("Punctuator", "}")) {
            body.push(this.parseStatement());
        }

        const close = this.expect("Punctuator", "}", "Expected '}' to close block");

        return {
            kind: "BlockStatement",
            start: this.pos_(open),
            end: this.endPos_(close ?? this.tokens[this.pos - 1]),
            body
        };

    }

    /** Parses "if test [then] consequent [else alternate]". */
    private parseIf(): AST.IfStatement {

        const start = this.pos_(this.current());
        this.advance();

        const test = this.parseExpression();
        this.match("Keyword", "then"); // optional, GM8 allows "if cond then stmt"
        const consequent = this.parseStatement();
        let alternate: AST.Statement | null = null;

        if (this.match("Keyword", "else")) {
            alternate = this.parseStatement();
        }

        return { kind: "IfStatement", start, end: consequent.end, test, consequent, alternate };

    }

    /** Parses "while test body". */
    private parseWhile(): AST.WhileStatement {
        const start = this.pos_(this.current());
        this.advance();
        const test = this.parseExpression();
        const body = this.parseStatement();
        return { kind: "WhileStatement", start, end: body.end, test, body };
    }

    /** Parses "do body until test". */
    private parseDoUntil(): AST.DoUntilStatement {

        const start = this.pos_(this.current());
        this.advance();

        const body = this.parseStatement();

        this.expect("Keyword", "until", "Expected 'until' after 'do' block");

        const test = this.parseExpression();
        this.consumeOptionalSemicolon();

        return { kind: "DoUntilStatement", start, end: test.end, body, test };

    }

    /** Parses a C-style "for (init; test; update) body". */
    private parseFor(): AST.ForStatement {

        const start = this.pos_(this.current());
        this.advance();

        this.expect("Punctuator", "(", "Expected '(' after 'for'");

        const init = this.check("Punctuator", ";") ? null : this.parseForClauseStatement();
        this.expect("Punctuator", ";", "Expected ';' after for-loop initializer");

        const test = this.check("Punctuator", ";") ? null : this.parseExpression();
        this.expect("Punctuator", ";", "Expected ';' after for-loop condition");

        const update = this.check("Punctuator", ")") ? null : this.parseForClauseStatement();
        this.expect("Punctuator", ")", "Expected ')' after for-loop clauses");

        const body = this.parseStatement();

        return {
            kind: "ForStatement",
            start,
            end: body.end,
            init,
            test,
            update,
            body
        };

    }

    /** Parses a for-loop's init/update clause: a plain assignment or var-decl without its own trailing ";" — the for-loop's own ";"/")" delimits it instead. */
    private parseForClauseStatement(): AST.Statement {

        if (this.check("Keyword", "var")) {
            return this.parseVarDeclaration(false);
        }

        const start = this.pos_(this.current());
        const expression = this.parseAssignmentOrExpression();

        return {
            kind: "ExpressionStatement",
            start,
            end: expression.end,
            expression
        };

    }

    /** Parses "repeat count body". */
    private parseRepeat(): AST.RepeatStatement {
        const start = this.pos_(this.current());
        this.advance();
        const count = this.parseExpression();
        const body = this.parseStatement();
        return { kind: "RepeatStatement", start, end: body.end, count, body };
    }

    /** Parses "switch discriminant { case test: ... default: ... }". */
    private parseSwitch(): AST.SwitchStatement {

        const start = this.pos_(this.current());
        this.advance();

        const discriminant = this.parseExpression();
        this.expect("Punctuator", "{", "Expected '{' after switch expression");

        const cases: AST.SwitchCase[] = [];

        while (!this.isAtEnd() && !this.check("Punctuator", "}")) {

            const caseStart = this.pos_(this.current());

            let test: AST.Expression | null = null;

            if (this.match("Keyword", "case")) {
                test = this.parseExpression();
            } else if (!this.match("Keyword", "default")) {
                this.error("Expected 'case' or 'default'", this.current());
                this.synchronize();
                continue;
            }

            this.expect("Punctuator", ":", "Expected ':' after case label");

            const consequent: AST.Statement[] = [];

            while (
                !this.isAtEnd() &&
                !this.check("Punctuator", "}") &&
                !this.check("Keyword", "case") &&
                !this.check("Keyword", "default")
            ) {
                consequent.push(this.parseStatement());
            }

            cases.push({
                kind: "SwitchCase",
                start: caseStart,
                end: this.endPos_(this.tokens[this.pos - 1]),
                test,
                consequent
            });

        }

        const close = this.expect("Punctuator", "}", "Expected '}' to close switch");

        return {
            kind: "SwitchStatement",
            start,
            end: this.endPos_(close ?? this.tokens[this.pos - 1]),
            discriminant,
            cases
        };

    }

    /** Parses "with object body". */
    private parseWith(): AST.WithStatement {
        const start = this.pos_(this.current());
        this.advance();
        const object = this.parseExpression();
        const body = this.parseStatement();
        return { kind: "WithStatement", start, end: body.end, object, body };
    }

    /** Parses "var name [= init] (, name [= init])*". consumeSemicolon is false when called from a for-loop's init clause, which supplies its own ";". */
    private parseVarDeclaration(consumeSemicolon = true): AST.VarDeclaration {

        const start = this.pos_(this.current());
        this.advance();

        const declarations: AST.VarDeclarator[] = [];

        do {

            if (!this.check("Identifier")) {
                this.error("Expected variable name after 'var'", this.current());
                break;
            }

            const nameToken = this.advance();

            let init: AST.Expression | null = null;

            if (this.match("Punctuator", "=")) {
                init = this.parseExpression();
            }

            declarations.push({
                kind: "VarDeclarator",
                start: this.pos_(nameToken),
                end: init ? init.end : this.endPos_(nameToken),
                name: nameToken.value,
                init
            });

        } while (this.match("Punctuator", ","));

        if (consumeSemicolon) this.consumeOptionalSemicolon();

        return {
            kind: "VarDeclaration",
            start,
            end: this.endPos_(this.tokens[this.pos - 1]),
            declarations
        };

    }

    /** Parses "globalvar name (, name)*". */
    private parseGlobalVarDeclaration(): AST.GlobalVarDeclaration {

        const start = this.pos_(this.current());
        this.advance();

        const names: string[] = [];

        do {
            const nameToken = this.current();
            if (nameToken.type !== "Identifier") {
                this.error("Expected variable name after 'globalvar'", nameToken);
                break;
            }
            this.advance();
            names.push(nameToken.value);
        } while (this.match("Punctuator", ","));

        this.consumeOptionalSemicolon();

        return {
            kind: "GlobalVarDeclaration",
            start,
            end: this.endPos_(this.tokens[this.pos - 1]),
            names
        };

    }

    /** Parses a single-keyword statement ("break" / "continue" / "exit") with no arguments. */
    private parseSimpleKeyword(
        kind: "BreakStatement" | "ContinueStatement" | "ExitStatement"
    ): AST.Statement {
        const token = this.advance();
        this.consumeOptionalSemicolon();
        return { kind, start: this.pos_(token), end: this.endPos_(this.tokens[this.pos - 1]) };
    }

    /** Whether the current token could begin an expression — used to tell a bare "return;" apart from "return value;" without a lookahead grammar rule for each case. */
    private canStartExpression(): boolean {

        const token = this.current();

        if (token.type === "Number" || token.type === "String" || token.type === "Identifier") {
            return true;
        }

        if (token.type === "Punctuator" && (token.value === "(" || token.value === "-" || token.value === "+" || token.value === "!" || token.value === "~")) {
            return true;
        }

        if (token.type === "Keyword") {
            return ["true", "false", "self", "other", "all", "noone", "global", "not"].includes(token.value);
        }

        return false;

    }

    /** Parses "return [argument]"; the argument is optional. */
    private parseReturn(): AST.ReturnStatement {

        const start = this.pos_(this.current());
        this.advance();

        const argument = this.canStartExpression() ? this.parseExpression() : null;
        this.consumeOptionalSemicolon();

        return {
            kind: "ReturnStatement",
            start,
            end: this.endPos_(this.tokens[this.pos - 1]),
            argument
        };

    }

    /** Parses a statement that's just an expression (typically an assignment or a call), e.g. "state_type = "jump";". */
    private parseExpressionStatement(): AST.ExpressionStatement {

        const start = this.pos_(this.current());
        const expression = this.parseAssignmentOrExpression();

        this.consumeOptionalSemicolon();

        return {
            kind: "ExpressionStatement",
            start,
            end: expression.end,
            expression
        };

    }

    // ---- expressions ----------------------------------------------------

    // Used at statement position (and for-loop clauses): a bare "=" here is
    // assignment. Anywhere else, "=" falls through to parseBinaryFrom, where
    // it is treated as equality — matching real GM8 semantics.
    private parseAssignmentOrExpression(): AST.Expression {

        const left = this.parseUnary();

        if (this.check("Punctuator") && ASSIGNMENT_OPERATORS.has(this.current().value)) {

            const operator = this.advance().value;
            const right = this.parseExpression();

            return {
                kind: "AssignmentExpression",
                start: left.start,
                end: right.end,
                operator,
                left,
                right
            };

        }

        return this.parseBinaryFrom(left, 0);

    }

    /** Parses a full expression where a bare "=" means equality (the condition of an if/while/switch/etc., a call argument, an array index, an operand of a larger expression — anywhere that isn't the very start of a statement). */
    private parseExpression(): AST.Expression {
        return this.parseBinaryFrom(this.parseUnary(), 0);
    }

    /** Precedence-climbing binary operator parser: repeatedly consumes an operator at or above minPrecedence and folds `left OP right` into a new left, so "a + b * c" groups as "a + (b * c)". */
    private parseBinaryFrom(left: AST.Expression, minPrecedence: number): AST.Expression {

        for (;;) {

            const token = this.current();
            const operator = token.value;

            if (token.type !== "Punctuator" && token.type !== "Keyword") break;

            const precedence = PRECEDENCE[operator];
            if (precedence === undefined || precedence < minPrecedence) break;

            this.advance();

            const right = this.parseBinaryClimb(precedence + 1);

            left = {
                kind: "BinaryExpression",
                start: left.start,
                end: right.end,
                operator,
                left,
                right
            };

        }

        return left;

    }

    /** Parses the right-hand operand of a binary operator: a fresh unary expression, then anything tighter-binding that follows it. */
    private parseBinaryClimb(minPrecedence: number): AST.Expression {
        return this.parseBinaryFrom(this.parseUnary(), minPrecedence);
    }

    /** Parses a prefix unary expression ("!", "-", "+", "~", "not"), or falls through to a postfix expression. */
    private parseUnary(): AST.Expression {

        const token = this.current();
        const isUnaryOp =
            (token.type === "Punctuator" && ["!", "-", "+", "~"].includes(token.value)) ||
            (token.type === "Keyword" && token.value === "not");

        if (isUnaryOp) {
            this.advance();
            const argument = this.parseUnary();
            return {
                kind: "UnaryExpression",
                start: this.pos_(token),
                end: argument.end,
                operator: token.value,
                argument
            };
        }

        return this.parsePostfix();

    }

    /** Parses a primary expression followed by any chain of calls "f(...)", member access ".x", and indexing "[i]" or "[i, j]". */
    private parsePostfix(): AST.Expression {

        let expr = this.parsePrimary();

        for (;;) {

            if (this.check("Punctuator", "(")) {

                this.advance();
                const args: AST.Expression[] = [];

                if (!this.check("Punctuator", ")")) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.match("Punctuator", ","));
                }

                const close = this.expect("Punctuator", ")", "Expected ')' after arguments");

                expr = {
                    kind: "CallExpression",
                    start: expr.start,
                    end: this.endPos_(close ?? this.tokens[this.pos - 1]),
                    callee: expr,
                    args
                };

                continue;

            }

            if (this.check("Punctuator", ".")) {

                this.advance();
                const nameToken = this.current();

                if (nameToken.type !== "Identifier" && nameToken.type !== "Keyword") {
                    this.error("Expected property name after '.'", nameToken);
                } else {
                    this.advance();
                }

                expr = {
                    kind: "MemberExpression",
                    start: expr.start,
                    end: this.endPos_(nameToken),
                    object: expr,
                    property: nameToken.value
                };

                continue;

            }

            if (this.check("Punctuator", "[")) {

                this.advance();
                const indices: AST.Expression[] = [];

                if (!this.check("Punctuator", "]")) {
                    do {
                        indices.push(this.parseExpression());
                    } while (this.match("Punctuator", ","));
                }

                const close = this.expect("Punctuator", "]", "Expected ']' after index");

                expr = {
                    kind: "IndexExpression",
                    start: expr.start,
                    end: this.endPos_(close ?? this.tokens[this.pos - 1]),
                    object: expr,
                    indices
                };

                continue;

            }

            break;

        }

        return expr;

    }

    /** Parses the smallest possible expression: a literal, an identifier, or a parenthesized sub-expression. Any token that can't start an expression is reported as an error and consumed so the parser can keep going. */
    private parsePrimary(): AST.Expression {

        const token = this.current();

        if (token.type === "Number") {
            this.advance();
            return { kind: "NumericLiteral", start: this.pos_(token), end: this.endPos_(token), value: token.value };
        }

        if (token.type === "String") {
            this.advance();
            return { kind: "StringLiteral", start: this.pos_(token), end: this.endPos_(token), value: token.value };
        }

        if (token.type === "Keyword" && (token.value === "true" || token.value === "false")) {
            this.advance();
            return { kind: "BooleanLiteral", start: this.pos_(token), end: this.endPos_(token), value: token.value === "true" };
        }

        if (
            token.type === "Identifier" ||
            (token.type === "Keyword" && ["self", "other", "all", "noone", "global"].includes(token.value))
        ) {
            this.advance();
            return { kind: "Identifier", start: this.pos_(token), end: this.endPos_(token), name: token.value };
        }

        if (token.type === "Punctuator" && token.value === "(") {
            this.advance();
            const expression = this.parseExpression();
            const close = this.expect("Punctuator", ")", "Expected ')' to close expression");
            return {
                kind: "GroupExpression",
                start: this.pos_(token),
                end: this.endPos_(close ?? this.tokens[this.pos - 1]),
                expression
            };
        }

        this.error(`Expected expression, found '${token.value || token.type}'`, token);

        if (!this.isAtEnd()) this.advance();

        return { kind: "ErrorExpression", start: this.pos_(token), end: this.endPos_(token) };

    }

}
