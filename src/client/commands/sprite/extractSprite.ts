import * as vscode from "vscode";

export function registerExtractSprite(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.extractSprite", async ()=>{
            vscode.window.showInformationMessage("extractSprite - TODO");
        })
    );
}
