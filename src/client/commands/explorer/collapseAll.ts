import * as vscode from "vscode";

export function registerCollapseAll(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.collapseAll", async ()=>{
            vscode.window.showInformationMessage("collapseAll - TODO");
        })
    );
}
