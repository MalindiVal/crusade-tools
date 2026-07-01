import * as vscode from "vscode";

export function registerPackSprite(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.packSprite", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("packSprite - TODO"));
        })
    );
}
