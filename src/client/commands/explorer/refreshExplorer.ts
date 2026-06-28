import * as vscode from "vscode";

export function registerRefreshExplorer(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.refreshExplorer", async ()=>{
            vscode.window.showInformationMessage("refreshExplorer - TODO");
        })
    );
}
