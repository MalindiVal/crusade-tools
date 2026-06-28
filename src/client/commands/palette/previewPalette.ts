import * as vscode from "vscode";

export function registerPreviewPalette(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.previewPalette", async ()=>{
            vscode.window.showInformationMessage("previewPalette - TODO");
        })
    );
}
