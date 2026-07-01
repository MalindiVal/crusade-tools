import * as vscode from "vscode";

export function registerExportProject(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.exportProject", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("exportProject - TODO"));
        })
    );
}
