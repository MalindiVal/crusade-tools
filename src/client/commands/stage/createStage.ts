import * as vscode from "vscode";

export function registerCreateStage(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.createStage", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("createStage - TODO"));
        })
    );
}
