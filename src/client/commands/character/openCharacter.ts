import * as vscode from "vscode";

export function registerOpenCharacter(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openCharacter", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("openCharacter - TODO"));
        })
    );
}
