import * as vscode from "vscode";

export function registerPreviewSprite(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.previewSprite", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("previewSprite - TODO"));
        })
    );
}
