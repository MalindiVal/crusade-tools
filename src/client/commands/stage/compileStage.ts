import * as vscode from "vscode";

export function registerCompileStage(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.compileStage", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("compileStage - TODO"));
        })
    );
}
