import * as vscode from "vscode";

export function registerOpenErrorLog(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openErrorLog", async ()=>{
            vscode.window.showInformationMessage("openErrorLog - TODO");
        })
    );
}
