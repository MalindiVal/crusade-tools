import * as vscode from "vscode";

export function registerValidateStage(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.validateStage", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("validateStage - TODO"));
        })
    );
}
