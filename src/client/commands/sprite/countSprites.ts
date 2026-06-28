import * as vscode from "vscode";

export function registerCountSprites(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.countSprites", async ()=>{
            vscode.window.showInformationMessage("countSprites - TODO");
        })
    );
}
