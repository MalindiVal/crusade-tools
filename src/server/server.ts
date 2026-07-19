import {
    createConnection,
    ProposedFeatures,
    TextDocuments,
    TextDocumentSyncKind,
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

import {
    KEYWORDS,
    BUILTIN_FUNCTIONS,
    BUILTIN_VARIABLES,
    ENGINE_VARIABLES
} from "./data/builtins";

import engineFunctions from "./data/engineFunctions.json";
import { validateDocument } from "./parser/validator";

const connection = createConnection(
    ProposedFeatures.all
);

const documents = new TextDocuments(TextDocument);

/** Builds a tab-through snippet for a function completion, e.g. "create_hitbox(${1:argument0}, ${2:argument1})"; a no-arg function just gets "name()". */
function snippetFor(name: string, params: string[]): string {

    if (params.length === 0) {
        return `${name}()`;
    }

    const placeholders = params
        .map((param, i) => `\${${i + 1}:${param}}`)
        .join(", ");

    return `${name}(${placeholders})`;

}

const completionItems: CompletionItem[] = [

    ...KEYWORDS.map((keyword): CompletionItem => ({
        label: keyword,
        kind: CompletionItemKind.Keyword
    })),

    ...BUILTIN_VARIABLES.map((variable): CompletionItem => ({
        label: variable.name,
        kind: CompletionItemKind.Variable,
        detail: variable.detail
    })),

    ...ENGINE_VARIABLES.map((variable): CompletionItem => ({
        label: variable.name,
        kind: CompletionItemKind.Field,
        detail: variable.detail
    })),

    ...BUILTIN_FUNCTIONS.map((fn): CompletionItem => ({
        label: fn.name,
        kind: CompletionItemKind.Function,
        detail: fn.detail,
        insertText: snippetFor(fn.name, fn.params),
        insertTextFormat: InsertTextFormat.Snippet
    })),

    ...engineFunctions.map((fn): CompletionItem => ({
        label: fn.name,
        kind: CompletionItemKind.Function,
        detail: fn.detail || "Crusade engine script",
        insertText: snippetFor(fn.name, fn.params),
        insertTextFormat: InsertTextFormat.Snippet
    }))

];

connection.onInitialize(() => {

    return {

        capabilities: {

            textDocumentSync:
                TextDocumentSyncKind.Incremental,

            completionProvider: {
                resolveProvider: false
            }

        }

    };

});

connection.onCompletion((): CompletionItem[] => completionItems);

/** Re-validates a document's syntax and pushes the resulting diagnostics to the client. */
function validate(document: TextDocument): void {
    connection.sendDiagnostics({
        uri: document.uri,
        diagnostics: validateDocument(document)
    });
}

documents.onDidChangeContent(change => validate(change.document));

documents.onDidClose(event => {
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

documents.listen(connection);

connection.listen();