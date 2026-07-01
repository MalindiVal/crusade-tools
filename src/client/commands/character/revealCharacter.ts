import * as vscode from "vscode";

export function registerRevealCharacter(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.revealCharacter", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("revealCharacter - TODO"));
        })
    );
}
