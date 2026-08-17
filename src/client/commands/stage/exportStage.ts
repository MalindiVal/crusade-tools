import * as vscode from "vscode";

export function registerExportStage(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.exportStage", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("exportStage - TODO"));
        })
    );
}
