import * as vscode from "vscode";

export function registerCleanProject(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.cleanProject", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("cleanProject - TODO"));
        })
    );
}
