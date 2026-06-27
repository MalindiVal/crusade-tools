import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CrusadeNode, CrusadeNodeType } from "./crusadeNode";

export class CrusadeTreeProvider
implements vscode.TreeDataProvider<CrusadeNode> {

    constructor(private root:string){}

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

        if (
    item.fullPath &&
    fs.existsSync(item.fullPath) &&
    fs.statSync(item.fullPath).isDirectory() &&
    item.type !== "root"
) {
    return Promise.resolve(
        this.categorizeFiles(item.fullPath)
    );
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

    private categorizeFiles(folderPath: string): CrusadeNode[] {

    const files = fs.readdirSync(folderPath);

    const groups = new Map<string, CrusadeNode[]>();

    const add = (group: string, file: string) => {

        if (!groups.has(group)) {
            groups.set(group, []);
        }

        const full = path.join(folderPath, file);

        const node = new CrusadeNode(
            file,
            "file",
            vscode.TreeItemCollapsibleState.None,
            full
        );

        node.command = {
            command: "vscode.open",
            title: "Open",
            arguments: [vscode.Uri.file(full)]
        };

        groups.get(group)!.push(node);
    };

    for (const file of files) {

        if (file.endsWith(".txt")) {
            add("📜 Scripts", file);
        } else {
            if (file.startsWith("box_") || file.endsWith("mask")) {
                add("📦 Collision", file);
            } if (file.startsWith("PALETTE")) {
                add("🎨 Palettes", file);
            } else if (file.startsWith("bg")) {
                add("🖼 Backgrounds", file);
            } else if (file.endsWith(".wav") || file.endsWith(".mp3") || file.endsWith(".ogg")) {
                add("🎵 Sounds", file);
            } else if (file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".gif")) {
                add("🖼 Sprites", file);
            }else if (file.endsWith(".bmp")) {
                add("🖼 Unpaletted Sprites", file);
            } else if (file.endsWith(".itm")) {
                add("Item points", file);
            } else if (file.endsWith(".bin")) {
                add("⚙ Compiled", file);
            } else {
                add("📄 Other", file);
            }
        }
            
        
    }

    return [...groups.entries()].map(([label, children]) =>
        new CrusadeNode(
            label,
            "group",
            vscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            children
        )
    );
}

}