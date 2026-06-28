import * as vscode from "vscode";

export function registerOpenGameFolder(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openGameFolder", async ()=>{
            vscode.window.showInformationMessage("openGameFolder - TODO");
        })
    );
}
