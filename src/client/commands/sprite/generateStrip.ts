import * as vscode from "vscode";

export function registerGenerateStrip(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.generateStrip", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("generateStrip - TODO"));
        })
    );
}
