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

const connection = createConnection(
    ProposedFeatures.all
);

const documents = new TextDocuments(TextDocument);

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

documents.listen(connection);

connection.listen();