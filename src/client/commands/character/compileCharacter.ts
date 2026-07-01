import * as vscode from "vscode";

export function registerCompileCharacter(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.compileCharacter", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("compileCharacter - TODO"));
        })
    );
}
