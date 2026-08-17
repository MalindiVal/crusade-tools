import * as vscode from "vscode";

export function registerOpenItem(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openItem", async ()=>{
            vscode.window.showInformationMessage(vscode.l10n.t("openItem - TODO"));
        })
    );
}
