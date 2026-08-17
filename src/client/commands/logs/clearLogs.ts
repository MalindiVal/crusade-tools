import * as vscode from "vscode";

export function registerClearLogs(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.clearLogs", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("clearLogs - TODO"));
        })
    );
}
