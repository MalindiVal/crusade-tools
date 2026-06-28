import * as vscode from "vscode";

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
            () => {
                vscode.window.showInformationMessage(
                    "Create Character (TODO)"
                );
            }
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

        this.registerCommand(
            "crusade-tools.previewSprite",
            (uri: vscode.Uri) => {
                vscode.commands.executeCommand(
                    "crusade-tools.previewSprite",
                    uri
                );
            }
        );

        this.registerCommand(
            "crusade-tools.previewPalette",
            (uri: vscode.Uri) => {
                vscode.commands.executeCommand(
                    "crusade-tools.previewPalette",
                    uri
                );
            }
        );

        this.registerCommand(
            "crusade-tools.previewStage",
            (uri: vscode.Uri) => {
                vscode.commands.executeCommand(
                    "crusade-tools.previewStage",
                    uri
                );
            }
        );

        this.registerCommand(
            "crusade-tools.previewMusic",
            (uri: vscode.Uri) => {
                vscode.commands.executeCommand(
                    "crusade-tools.previewMusic",
                    uri
                );
            }
        );

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