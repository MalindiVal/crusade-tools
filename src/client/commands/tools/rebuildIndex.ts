import * as vscode from "vscode";

export function registerRebuildIndex(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.rebuildIndex", async ()=>{
            vscode.window.showInformationMessage("rebuildIndex - TODO");
        })
    );
}
