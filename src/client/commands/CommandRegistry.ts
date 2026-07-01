import * as vscode from "vscode";

import { createCharacter } from "./character/createCharacter";

export class CommandRegistry {

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public register(): void {

        this.registerCommand(
            "crusade-tools.createCharacter",
            () => createCharacter(this.context)
        );

        this.registerCommand(
            "crusade-tools.openGame",
            () => {
                vscode.window.showInformationMessage(
                    vscode.l10n.t("Launch Smash Crusade (TODO)")
                );
            }
        );

        this.registerCommand(
            "crusade-tools.compileCharacter",
            (node) => {
                vscode.window.showInformationMessage(
                    vscode.l10n.t("Compile {0} (TODO)", node?.label ?? "")
                );
            }
        );

        // Preview commands are registered by PreviewManager
        // Do NOT register them here - they're handled by individual Preview classes

        this.registerCommand(
            "crusade-tools.toggleWatch",
            () => {
                vscode.window.showInformationMessage(
                    vscode.l10n.t("Toggle Log Watch (TODO)")
                );
            }
        );

        this.registerCommand(
            "crusade-tools.clearLogs",
            () => {
                vscode.window.showInformationMessage(
                    vscode.l10n.t("Clear Logs (TODO)")
                );
            }
        );

        this.registerCommand(
            "crusade-tools.openErrorLog",
            () => {
                vscode.window.showInformationMessage(
                    vscode.l10n.t("Open error.log (TODO)")
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