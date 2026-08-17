import * as vscode from "vscode";

export function registerWatchLogs(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.watchLogs", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("watchLogs - TODO"));
        })
    );
}
