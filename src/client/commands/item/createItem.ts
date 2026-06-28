import * as vscode from "vscode";

export function registerCreateItem(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.createItem", async ()=>{
            vscode.window.showInformationMessage("createItem - TODO");
        })
    );
}
