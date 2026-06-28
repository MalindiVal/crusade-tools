import * as vscode from "vscode";

export function registerOpenStage(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openStage", async ()=>{
            vscode.window.showInformationMessage("openStage - TODO");
        })
    );
}
