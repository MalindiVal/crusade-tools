import * as vscode from "vscode";

export function registerOpenSpriteCount(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openSpriteCount", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("openSpriteCount - TODO"));
        })
    );
}
