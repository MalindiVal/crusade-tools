import * as vscode from "vscode";

export function registerGenerateRecolor(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.generateRecolor", async ()=>{
            vscode.window.showInformationMessage("generateRecolor - TODO");
        })
    );
}
