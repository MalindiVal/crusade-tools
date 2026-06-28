import * as vscode from "vscode";

export function registerDeleteCharacter(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.deleteCharacter", async ()=>{
            vscode.window.showInformationMessage("deleteCharacter - TODO");
        })
    );
}
