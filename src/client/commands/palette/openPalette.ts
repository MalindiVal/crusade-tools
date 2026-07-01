import * as vscode from "vscode";

export function registerOpenPalette(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openPalette", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("openPalette - TODO"));
        })
    );
}
