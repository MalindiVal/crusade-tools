import * as vscode from "vscode";

export function registerCreatePalette(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.createPalette", async ()=>{
            vscode.window.showInformationMessage("createPalette - TODO");
        })
    );
}
