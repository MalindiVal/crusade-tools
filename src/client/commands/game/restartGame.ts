import * as vscode from "vscode";

export function registerRestartGame(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.restartGame", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("restartGame - TODO"));
        })
    );
}
