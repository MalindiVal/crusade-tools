import * as vscode from "vscode";

export function registerLaunchDebug(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.launchDebug", async ()=>{
            vscode.window.showInformationMessage("launchDebug - TODO");
        })
    );
}
