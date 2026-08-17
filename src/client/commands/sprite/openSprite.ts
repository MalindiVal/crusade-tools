import * as vscode from "vscode";

export function registerOpenSprite(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openSprite", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("openSprite - TODO"));
        })
    );
}
