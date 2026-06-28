import * as path from "path";
import * as vscode from "vscode";

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from "vscode-languageclient/node";

export class LanguageClientManager
implements vscode.Disposable {

    private client?: LanguageClient;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public start(): void {

        if (this.client) {
            return;
        }

        const serverModule = this.context.asAbsolutePath(
            path.join(
                "out",
                "server",
                "server.js"
            )
        );

        const serverOptions: ServerOptions = {

            run: {
                module: serverModule,
                transport: TransportKind.ipc
            },

            debug: {
                module: serverModule,
                transport: TransportKind.ipc,
                options: {
                    execArgv: [
                        "--nolazy",
                        "--inspect=6009"
                    ]
                }
            }

        };

        const clientOptions: LanguageClientOptions = {

            documentSelector: [
                {
                    language: "crusade-script",
                    scheme: "file"
                }
            ],

            synchronize: {
                fileEvents:
                    vscode.workspace.createFileSystemWatcher(
                        "**/*.txt"
                    )
            }

        };

        this.client = new LanguageClient(
            "crusade-tools",
            "Crusade Language Server",
            serverOptions,
            clientOptions
        );

        this.context.subscriptions.push(this.client);

        void this.client.start();

    }

    public async stop(): Promise<void> {

        if (this.client) {
            await this.client.stop();
            this.client = undefined;
        }

    }

    public dispose(): void {
        void this.stop();
    }

}