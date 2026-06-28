import * as vscode from "vscode";

export function registerCreateCharacter(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.createCharacter", async ()=>{
            vscode.window.showInformationMessage("createCharacter - TODO");
        })
    );
}
