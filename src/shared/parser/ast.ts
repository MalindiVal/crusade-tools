export interface Position {
    line: number;
    column: number;
}

export interface Node {
    kind: string;
    start: Position;
    end: Position;
}

export interface Program extends Node {
    kind: "Program";
    statements: Statement[];
}

export type Statement =
    | BlockStatement
    | IfStatement
    | WhileStatement
    | DoUntilStatement
    | ForStatement
    | RepeatStatement
    | SwitchStatement
    | WithStatement
    | VarDeclaration
    | GlobalVarDeclaration
    | BreakStatement
    | ContinueStatement
    | ReturnStatement
    | ExitStatement
    | ExpressionStatement
    | EmptyStatement
    | ErrorStatement;

export interface BlockStatement extends Node {
    kind: "BlockStatement";
    body: Statement[];
}

export interface IfStatement extends Node {
    kind: "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate: Statement | null;
}

export interface WhileStatement extends Node {
    kind: "WhileStatement";
    test: Expression;
    body: Statement;
}

export interface DoUntilStatement extends Node {
    kind: "DoUntilStatement";
    body: Statement;
    test: Expression;
}

export interface ForStatement extends Node {
    kind: "ForStatement";
    init: Statement | null;
    test: Expression | null;
    update: Statement | null;
    body: Statement;
}

export interface RepeatStatement extends Node {
    kind: "RepeatStatement";
    count: Expression;
    body: Statement;
}

export interface SwitchCase extends Node {
    kind: "SwitchCase";
    test: Expression | null;
    consequent: Statement[];
}

export interface SwitchStatement extends Node {
    kind: "SwitchStatement";
    discriminant: Expression;
    cases: SwitchCase[];
}

export interface WithStatement extends Node {
    kind: "WithStatement";
    object: Expression;
    body: Statement;
}

export interface VarDeclarator extends Node {
    kind: "VarDeclarator";
    name: string;
    init: Expression | null;
}

export interface VarDeclaration extends Node {
    kind: "VarDeclaration";
    declarations: VarDeclarator[];
}

export interface GlobalVarDeclaration extends Node {
    kind: "GlobalVarDeclaration";
    names: string[];
}

export interface BreakStatement extends Node {
    kind: "BreakStatement";
}

export interface ContinueStatement extends Node {
    kind: "ContinueStatement";
}

export interface ReturnStatement extends Node {
    kind: "ReturnStatement";
    argument: Expression | null;
}

export interface ExitStatement extends Node {
    kind: "ExitStatement";
}

export interface ExpressionStatement extends Node {
    kind: "ExpressionStatement";
    expression: Expression;
}

export interface EmptyStatement extends Node {
    kind: "EmptyStatement";
}

// Produced in place of a statement that could not be parsed, so the rest of
// the file can still be checked instead of aborting on the first error.
export interface ErrorStatement extends Node {
    kind: "ErrorStatement";
}

export type Expression =
    | Identifier
    | NumericLiteral
    | StringLiteral
    | BooleanLiteral
    | AssignmentExpression
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | MemberExpression
    | IndexExpression
    | GroupExpression
    | ErrorExpression;

export interface Identifier extends Node {
    kind: "Identifier";
    name: string;
}

export interface NumericLiteral extends Node {
    kind: "NumericLiteral";
    value: string;
}

export interface StringLiteral extends Node {
    kind: "StringLiteral";
    value: string;
}

export interface BooleanLiteral extends Node {
    kind: "BooleanLiteral";
    value: boolean;
}

export interface AssignmentExpression extends Node {
    kind: "AssignmentExpression";
    operator: string;
    left: Expression;
    right: Expression;
}

export interface BinaryExpression extends Node {
    kind: "BinaryExpression";
    operator: string;
    left: Expression;
    right: Expression;
}

export interface UnaryExpression extends Node {
    kind: "UnaryExpression";
    operator: string;
    argument: Expression;
}

export interface CallExpression extends Node {
    kind: "CallExpression";
    callee: Expression;
    args: Expression[];
}

export interface MemberExpression extends Node {
    kind: "MemberExpression";
    object: Expression;
    property: string;
}

export interface IndexExpression extends Node {
    kind: "IndexExpression";
    object: Expression;
    indices: Expression[];
}

export interface GroupExpression extends Node {
    kind: "GroupExpression";
    expression: Expression;
}

// Produced in place of an expression that could not be parsed.
export interface ErrorExpression extends Node {
    kind: "ErrorExpression";
}
