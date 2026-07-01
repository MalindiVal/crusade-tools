import * as vscode from "vscode";

export function registerCompileItem(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.compileItem", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("compileItem - TODO"));
        })
    );
}
