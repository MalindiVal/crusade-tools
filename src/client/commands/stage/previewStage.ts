import * as vscode from "vscode";

export function registerPreviewStage(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.previewStage", async ()=>{
            vscode.window.showInformationMessage("previewStage - TODO");
        })
    );
}
