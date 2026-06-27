import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { CrusadeNode } from "../tree/crusadeNode";

export abstract class CrusadeAnalyzer {

    constructor(
        protected readonly projectRoot: string
    ) {}

    abstract analyze(folder: string): CrusadeNode[];

    protected group(
        label: string,
        files: string[],
        root: string,
        names: string[]
    ): CrusadeNode {

        const children = names
            .filter(f => files.includes(f))
            .map(file => this.file(root, file));

        return this.groupNode(label, children);
    }

    protected category(
        label: string,
        files: string[],
        root: string
    ): CrusadeNode {

        return this.groupNode(
            label,
            files.map(file => this.file(root, file))
        );
    }

    protected groupNode(
        label: string,
        children: CrusadeNode[]
    ): CrusadeNode {

        return new CrusadeNode(
            label,
            "group",
            vscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            children
        );
    }

    protected folder(
        root: string,
        name: string
    ): CrusadeNode | null {

        const dir = path.join(root, name);

        if (!fs.existsSync(dir))
            return null;

        return new CrusadeNode(
            name,
            "folder",
            vscode.TreeItemCollapsibleState.Collapsed,
            dir
        );
    }

    protected file(
        root: string,
        name: string
    ): CrusadeNode {

        const full = path.join(root, name);

        const node = new CrusadeNode(
            name,
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
    }

    /**
     * Cherche automatiquement un dossier music/<nom>
     */
    protected musicGroup(resourceFolder: string): CrusadeNode | null {

        const name = path.basename(resourceFolder);

        const dir = path.join(
            this.projectRoot,
            "music",
            name
        );

        if (!fs.existsSync(dir))
            return null;

        const files = fs.readdirSync(dir)
            .filter(f => /\.(ogg|mp3|wav)$/i.test(f));

        if (files.length === 0)
            return null;

        return this.category(
            "🎵 Music",
            files,
            dir
        );
    }

    /**
     * Cherche automatiquement un dossier gfx/<nom>
     */
    protected spriteGroup(resourceFolder: string): CrusadeNode | null {

        const name = path.basename(resourceFolder);

        const dir = path.join(
            this.projectRoot,
            "gfx",
            name
        );

        if (!fs.existsSync(dir))
            return null;

        const files = fs.readdirSync(dir)
            .filter(f =>
                /\.(png|bmp|gif|jpg|jpeg)$/i.test(f)
            );

        if (files.length === 0)
            return null;

        return this.category(
            "🖼 Sprites",
            files,
            dir
        );
    }

    /**
     * Cherche automatiquement un dossier palettes/<nom>
     */
    protected paletteGroup(resourceFolder: string): CrusadeNode | null {

        const name = path.basename(resourceFolder);

        const dir = path.join(
            this.projectRoot,
            "palettes",
            name
        );

        if (!fs.existsSync(dir))
            return null;

        const files = fs.readdirSync(dir);

        if (files.length === 0)
            return null;

        return this.category(
            "🎨 Palettes",
            files,
            dir
        );
    }
}