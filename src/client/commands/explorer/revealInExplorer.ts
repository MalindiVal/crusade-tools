import * as vscode from "vscode";

export function registerRevealInExplorer(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.revealInExplorer", async ()=>{
            vscode.window.showInformationMessage("revealInExplorer - TODO");
        })
    );
}
