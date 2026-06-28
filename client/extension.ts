import * as path from "path";

import {
    LanguageClient,
    ServerOptions,
    TransportKind
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {

    const serverModule = context.asAbsolutePath(
        path.join("out","server","server.js")
    );

    const serverOptions: ServerOptions = {

        run: {

            module: serverModule,
            transport: TransportKind.ipc

        },

        debug: {

            module: serverModule,
            transport: TransportKind.ipc

        }

    };

    client = new LanguageClient(

        "crusade",

        "Crusade Language Server",

        serverOptions,

        {

            documentSelector: [

                {

                    scheme:"file",

                    language:"crusade-script"

                }

            ]

        }

    );

    client.start();

}