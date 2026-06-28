import * as vscode from "vscode";

export function registerExportPalette(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.exportPalette", async ()=>{
            vscode.window.showInformationMessage("exportPalette - TODO");
        })
    );
}
