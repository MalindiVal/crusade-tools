import * as vscode from "vscode";

export function registerLaunchGame(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.launchGame", async ()=>{
            vscode.window.showInformationMessage("launchGame - TODO");
        })
    );
}
