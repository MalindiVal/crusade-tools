import * as vscode from "vscode";

export function registerCopyPath(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.copyPath", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("copyPath - TODO"));
        })
    );
}
