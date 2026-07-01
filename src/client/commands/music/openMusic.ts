import * as vscode from "vscode";

export function registerOpenMusic(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openMusic", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("openMusic - TODO"));
        })
    );
}
