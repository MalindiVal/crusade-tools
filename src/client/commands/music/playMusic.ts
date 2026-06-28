import * as vscode from "vscode";

export function registerPlayMusic(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.playMusic", async ()=>{
            vscode.window.showInformationMessage("playMusic - TODO");
        })
    );
}
