import * as vscode from "vscode";

export function registerImportMusic(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.importMusic", async ()=>{
            vscode.window.showInformationMessage("importMusic - TODO");
        })
    );
}
