import * as vscode from "vscode";

export function registerExportLogs(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.exportLogs", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("exportLogs - TODO"));
        })
    );
}
