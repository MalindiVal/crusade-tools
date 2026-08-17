import * as vscode from "vscode";

export function registerLaunchTraining(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.launchTraining", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("launchTraining - TODO"));
        })
    );
}
