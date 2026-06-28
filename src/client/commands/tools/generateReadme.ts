import * as vscode from "vscode";

export function registerGenerateReadme(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.generateReadme", async ()=>{
            vscode.window.showInformationMessage("generateReadme - TODO");
        })
    );
}
