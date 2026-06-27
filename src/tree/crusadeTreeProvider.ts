import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CrusadeNode } from "./crusadeNode";

export class CrusadeTreeProvider
implements vscode.TreeDataProvider<CrusadeNode> {

    constructor(private root:string){}

    getTreeItem(item: CrusadeNode) {
        return item;
    }

    getChildren(item?: CrusadeNode): Thenable<CrusadeNode[]> {

        if(!item){

            return Promise.resolve([

                new CrusadeNode(
                    "Fighters",
                    vscode.TreeItemCollapsibleState.Collapsed
                ),

                new CrusadeNode(
                    "Stages",
                    vscode.TreeItemCollapsibleState.Collapsed
                ),

                new CrusadeNode(
                    "Items",
                    vscode.TreeItemCollapsibleState.Collapsed
                ),

                new CrusadeNode(
                    "Music",
                    vscode.TreeItemCollapsibleState.Collapsed
                ),

                new CrusadeNode(
                    "Palettes",
                    vscode.TreeItemCollapsibleState.Collapsed
                )

            ]);

        }

        switch(item.label){

            case "Fighters":

                return Promise.resolve(
                    this.loadFolder("fighter")
                );

            case "Stages":

                return Promise.resolve(
                    this.loadFolder("stage")
                );

            case "Items":

                return Promise.resolve(
                    this.loadFolder("item")
                );

            case "Music":

                return Promise.resolve(
                    this.loadFolder("music")
                );

            case "Palettes":

                return Promise.resolve(
                    this.loadFolder("palettes")
                );

            default:

                return Promise.resolve([]);

        }

    }

    private loadFolder(folder:string): CrusadeNode[]{

        const dir = path.join(this.root, folder);

        if(!fs.existsSync(dir))
            return [];

        return fs.readdirSync(dir,{withFileTypes:true})
            .filter(f=>f.isDirectory())
            .map(f=>

                new CrusadeNode(

                    f.name,

                    vscode.TreeItemCollapsibleState.None,

                    path.join(dir,f.name)

                )

            );

    }

}