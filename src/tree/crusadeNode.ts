import * as vscode from "vscode";

export type CrusadeNodeType =
    | "root"
    | "fighter"
    | "stage"
    | "item"
    | "music"
    | "palette"
    | "folder"
    | "group"
    | "file";

export class CrusadeNode extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly type: CrusadeNodeType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly fullPath?: string,
        public readonly children?: CrusadeNode[]
    ) {
        super(label, collapsibleState);

        switch (type) {
            case "fighter":
                this.iconPath = new vscode.ThemeIcon("account");
                break;

            case "stage":
                this.iconPath = new vscode.ThemeIcon("map");
                break;

            case "item":
                this.iconPath = new vscode.ThemeIcon("package");
                break;

            case "music":
                this.iconPath = new vscode.ThemeIcon("music");
                break;

            case "palette":
                this.iconPath = new vscode.ThemeIcon("symbol-color");
                break;

            case "folder":
                this.iconPath = new vscode.ThemeIcon("folder");
                break;

            case "file":
                this.iconPath = new vscode.ThemeIcon("file");
                break;
        }
    }
}