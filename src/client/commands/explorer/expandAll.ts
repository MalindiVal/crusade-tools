import * as vscode from "vscode";

export function registerExpandAll(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.expandAll", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("expandAll - TODO"));
        })
    );
}
