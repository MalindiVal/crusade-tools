import * as vscode from "vscode";

export function registerOpenSpriteCount(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.openSpriteCount", async ()=>{
            vscode.window.showInformationMessage("openSpriteCount - TODO");
        })
    );
}
