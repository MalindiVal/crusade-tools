import * as vscode from "vscode";

export function registerRebuildIndex(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.rebuildIndex", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("rebuildIndex - TODO"));
        })
    );
}
