import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { Lexer } from "../../shared/parser/Lexer";
import { Parser } from "../../shared/parser/Parser";

export function validateDocument(document: TextDocument): Diagnostic[] {

    const { tokens, errors: lexErrors } = new Lexer(document.getText()).tokenize();
    const { errors: parseErrors } = Parser.parse(tokens);

    return [...lexErrors, ...parseErrors].map((error): Diagnostic => ({
        severity: DiagnosticSeverity.Error,
        source: "crusade-script",
        message: error.message,
        range: {
            start: { line: error.line, character: error.column },
            end: { line: error.endLine, character: error.endColumn }
        }
    }));

}
