import * as vscode from "vscode";

import { createCharacter } from "./character/createCharacter";

export class CommandRegistry {

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public register(): void {

        this.registerCommand(
            "crusade-tools.refreshExplorer",
            () => {
                vscode.commands.executeCommand(
                    "workbench.actions.treeView.crusadeExplorer.refresh"
                );
            }
        );

        this.registerCommand(
            "crusade-tools.createCharacter",
            () => createCharacter(this.context)
        );

        this.registerCommand(
            "crusade-tools.openGame",
            () => {
                vscode.window.showInformationMessage(
                    "Launch Smash Crusade (TODO)"
                );
            }
        );

        this.registerCommand(
            "crusade-tools.compileCharacter",
            (node) => {
                vscode.window.showInformationMessage(
                    `Compile ${node?.label ?? ""} (TODO)`
                );
            }
        );

        // Preview commands are registered by PreviewManager
        // Do NOT register them here - they're handled by individual Preview classes

        this.registerCommand(
            "crusade-tools.toggleWatch",
            () => {
                vscode.window.showInformationMessage(
                    "Toggle Log Watch (TODO)"
                );
            }
        );

        this.registerCommand(
            "crusade-tools.clearLogs",
            () => {
                vscode.window.showInformationMessage(
                    "Clear Logs (TODO)"
                );
            }
        );

        this.registerCommand(
            "crusade-tools.openErrorLog",
            () => {
                vscode.window.showInformationMessage(
                    "Open error.log (TODO)"
                );
            }
        );

    }

    private registerCommand(
        id: string,
        callback: (...args: any[]) => any
    ): void {

        this.context.subscriptions.push(

            vscode.commands.registerCommand(
                id,
                callback
            )

        );

    }

}