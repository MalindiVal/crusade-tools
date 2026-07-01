import * as vscode from "vscode";

export function registerImportProject(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.importProject", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("importProject - TODO"));
        })
    );
}
