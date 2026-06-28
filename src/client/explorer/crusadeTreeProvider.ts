import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CrusadeNode, CrusadeNodeType } from "./crusadeNode";
import { FighterAnalyzer } from "../analyzers/FighterAnalyzer";
import { StageAnalyzer } from "../analyzers/StageAnalyzer";
import { ItemAnalyzer } from "../analyzers/ItemAnalyzer";
import { MusicAnalyzer } from "../analyzers/MusicAnalyser";
import { CrusadeAnalyzer } from "../analyzers/CrusadeAnalyzer";

export class CrusadeTreeProvider
implements vscode.TreeDataProvider<CrusadeNode> {

    private analyzers = new Map<CrusadeNodeType, CrusadeAnalyzer>();

    constructor(private root:string){
        this.analyzers.set("fighter", new FighterAnalyzer(root));
this.analyzers.set("stage", new StageAnalyzer(root));
this.analyzers.set("item", new ItemAnalyzer(root));
this.analyzers.set("music", new MusicAnalyzer(root));
    }

    public getTreeItem(item: CrusadeNode) {
        return item;
    }

    public getChildren(item?: CrusadeNode): Thenable<CrusadeNode[]> {

        if (item?.type === "group") {
    return Promise.resolve(item.children ?? []);
}

        if(!item){

            return Promise.resolve([

                new CrusadeNode(
                    "Fighters",
                    "root",
                    vscode.TreeItemCollapsibleState.Collapsed
                ),

                new CrusadeNode(
                    "Stages",
                    "root",
                    vscode.TreeItemCollapsibleState.Collapsed
                ),

                new CrusadeNode(
                    "Items",
                    "root",
                    vscode.TreeItemCollapsibleState.Collapsed
                ),

                new CrusadeNode(
                    "Music",
                    "root",
                    vscode.TreeItemCollapsibleState.Collapsed
                ),

                new CrusadeNode(
                    "Palettes",
                    "fighter",
                    vscode.TreeItemCollapsibleState.Collapsed
                )

            ]);

        }

        if (item.fullPath) {

            const analyzer = this.analyzers.get(item.type);

            if (analyzer) {
                return Promise.resolve(
                    analyzer.analyze(item.fullPath)
                );
            }

            if (item.type === "folder") {
                return Promise.resolve(
                    this.loadFiles(item.fullPath)
                );
            }

        }

        switch(item.label){

            case "Fighters":
    return Promise.resolve(
        this.loadFolder("fighter", "fighter")
    );

case "Stages":
    return Promise.resolve(
        this.loadFolder("stage", "stage")
    );

case "Items":
    return Promise.resolve(
        this.loadFolder("item", "item")
    );

case "Music":
    return Promise.resolve(
        this.loadFolder("music", "music")
    );

case "Palettes":
    return Promise.resolve(
        this.loadFolder("palettes", "palette")
    );

            default:

                return Promise.resolve([]);

        }

    }

    private loadFolder(
    folder: string,
    type: CrusadeNodeType
    ): CrusadeNode[] {

        const dir = path.join(this.root, folder);

        if (!fs.existsSync(dir))
            return [];

        return fs.readdirSync(dir, { withFileTypes: true })
            .filter(f => f.isDirectory())
            .map(f => {

                const node = new CrusadeNode(
                    f.name,
                    type,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    path.join(dir, f.name)
                );

                return node;

            })
            .sort((a, b) => a.label.localeCompare(b.label));

    }

    private loadFiles(folderPath: string): CrusadeNode[] {

    return fs.readdirSync(folderPath, { withFileTypes: true })
        .map(file => {

            const full = path.join(folderPath, file.name);

            if (file.isDirectory()) {

                return new CrusadeNode(
                    file.name,
                    "folder",
                    vscode.TreeItemCollapsibleState.Collapsed,
                    full
                );

            }

            const node = new CrusadeNode(
                file.name,
                "file",
                vscode.TreeItemCollapsibleState.None,
                full
            );

            node.command = {
                command: "vscode.open",
                title: "Open",
                arguments: [
                    vscode.Uri.file(full)
                ]
            };

            return node;

        })
        .sort((a, b) => {

            if (
                a.collapsibleState !==
                b.collapsibleState
            ) {

                return b.collapsibleState -
                    a.collapsibleState;

            }

            return a.label.localeCompare(b.label);

        });

}

}