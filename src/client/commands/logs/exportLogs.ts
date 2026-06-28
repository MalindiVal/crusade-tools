import * as vscode from "vscode";

export function registerExportLogs(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.exportLogs", async ()=>{
            vscode.window.showInformationMessage("exportLogs - TODO");
        })
    );
}
