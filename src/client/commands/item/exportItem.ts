import * as vscode from "vscode";

export function registerExportItem(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.exportItem", async ()=>{
            vscode.window.showInformationMessage("exportItem - TODO");
        })
    );
}
