import * as vscode from "vscode";

export class CrusadeNode extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly fullPath?: string
    ) {
        super(label, collapsibleState);

        if (fullPath) {

            this.command = {
                command: "vscode.openFolder",
                title: "Open",
                arguments: [
                    vscode.Uri.file(fullPath),
                    false
                ]
            };
        }
    }
}