import * as vscode from "vscode";

export function registerStopMusic(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.stopMusic", async ()=>{
            vscode.window.showInformationMessage("stopMusic - TODO");
        })
    );
}
