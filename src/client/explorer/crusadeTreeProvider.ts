import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CrusadeNode, CrusadeNodeType } from "./CrusadeNode";
import { FighterAnalyzer } from "../analyzers/FighterAnalyzer";
import { StageAnalyzer } from "../analyzers/StageAnalyzer";
import { ItemAnalyzer } from "../analyzers/ItemAnalyzer";
import { MusicAnalyzer } from "../analyzers/MusicAnalyzer";
import { CrusadeAnalyzer } from "../analyzers/CrusadeAnalyzer";

export class CrusadeTreeProvider
implements vscode.TreeDataProvider<CrusadeNode> {

    private analyzers = new Map<CrusadeNodeType, CrusadeAnalyzer>();
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<CrusadeNode | undefined>();

    public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    public refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

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

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        const config = this.binListingConfig(type);

        const dirNodes = entries
            .filter(f => f.isDirectory())
            .map(f => {

                const node = new CrusadeNode(
                    f.name,
                    type,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    path.join(dir, f.name)
                );

                if (config) {

                    const icon = this.findIcon(config.iconDir, f.name);

                    if (icon) {
                        node.iconPath = vscode.Uri.file(icon);
                    }

                }

                return node;

            });

        if (!config) {
            return dirNodes.sort((a, b) => a.label.localeCompare(b.label));
        }

        // Entités dont seul le script compilé <type>/<nom>.bin existe,
        // sans dossier source : on les liste à part.
        const dirNames = new Set(
            entries.filter(f => f.isDirectory()).map(f => f.name)
        );

        const binOnlyNodes = entries
            .filter(f => f.isFile() && /\.bin$/i.test(f.name))
            .map(f => path.basename(f.name, path.extname(f.name)))
            .filter(name => !dirNames.has(name))
            .map(name => {

                const full = path.join(dir, `${name}.bin`);

                const node = new CrusadeNode(
                    name,
                    type,
                    vscode.TreeItemCollapsibleState.None,
                    full
                );

                const icon = this.findIcon(config.iconDir, name);

                if (icon) {
                    node.iconPath = vscode.Uri.file(icon);
                }

                node.command = {
                    command: config.previewCommand,
                    title: "Preview Data",
                    arguments: [vscode.Uri.file(full)]
                };

                return node;

            });

        return [...dirNodes, ...binOnlyNodes]
            .sort((a, b) => a.label.localeCompare(b.label));

    }

    /**
     * Dossier d'icônes et commande de preview de données pour les types
     * d'entités qui supportent l'icône d'arbre + le listage "bin seul".
     */
    private binListingConfig(
        type: CrusadeNodeType
    ): { iconDir: string; previewCommand: string } | undefined {

        switch (type) {

            case "fighter":
                return {
                    iconDir: path.join(this.root, "gfx", "stock"),
                    previewCommand: "crusade-tools.previewCharacterData"
                };

            case "stage":
                return {
                    iconDir: path.join(this.root, "gfx", "stgicons"),
                    previewCommand: "crusade-tools.previewStageData"
                };

            default:
                return undefined;

        }

    }

    /**
     * Cherche une icône dont le nom commence par celui de l'entité
     * dans le dossier donné (correspondance exacte privilégiée).
     */
    private findIcon(dir: string, name: string): string | undefined {

        if (!fs.existsSync(dir))
            return undefined;

        const exact = path.join(dir, `${name}.png`);

        if (fs.existsSync(exact))
            return exact;

        const lower = name.toLowerCase();

        const match = fs.readdirSync(dir)
            .filter(f => /\.(png|bmp|gif|jpg|jpeg)$/i.test(f))
            .find(f => f.toLowerCase().startsWith(lower));

        return match
            ? path.join(dir, match)
            : undefined;

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