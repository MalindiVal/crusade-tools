import * as vscode from "vscode";

export function registerSettings(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.settings", async ()=>{
            vscode.window.showInformationMessage("settings - TODO");
        })
    );
}
