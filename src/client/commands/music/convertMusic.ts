import * as vscode from "vscode";

export function registerConvertMusic(context:vscode.ExtensionContext):void {
    context.subscriptions.push(
        vscode.commands.registerCommand("crusade.convertMusic", async ()=>{
            vscode.window.showInformationMessage("convertMusic - TODO");
        })
    );
}
