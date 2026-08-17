import * as vscode from "vscode";

export function registerLaunchDebug(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.launchDebug", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("launchDebug - TODO"));
        })
    );
}
