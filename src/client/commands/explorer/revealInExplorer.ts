import * as vscode from "vscode";

export function registerRevealInExplorer(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.revealInExplorer", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("revealInExplorer - TODO"));
        })
    );
}
