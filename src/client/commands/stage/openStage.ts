import * as vscode from "vscode";

export function registerOpenStage(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openStage", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("openStage - TODO"));
        })
    );
}
