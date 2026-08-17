import * as vscode from "vscode";

export function registerExportCharacter(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.exportCharacter", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("exportCharacter - TODO"));
        })
    );
}
