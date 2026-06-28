import * as vscode from "vscode";

export function registerCompileItem(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.compileItem", async ()=>{
            vscode.window.showInformationMessage("compileItem - TODO");
        })
    );
}
