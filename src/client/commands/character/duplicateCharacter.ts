import * as vscode from "vscode";

export function registerDuplicateCharacter(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.duplicateCharacter", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("duplicateCharacter - TODO"));
        })
    );
}
