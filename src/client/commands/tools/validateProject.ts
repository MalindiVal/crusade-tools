import * as vscode from "vscode";

export function registerValidateProject(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.validateProject", async ()=>{
            vscode.window.showInformationMessage("validateProject - TODO");
        })
    );
}
