import * as vscode from "vscode";

export function registerWatchLogs(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.watchLogs", async ()=>{
            vscode.window.showInformationMessage("watchLogs - TODO");
        })
    );
}
