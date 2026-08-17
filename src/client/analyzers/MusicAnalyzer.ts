import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { CrusadeNode } from "../explorer/CrusadeNode";
import { CrusadeAnalyzer } from "./CrusadeAnalyzer";

export class MusicAnalyzer extends CrusadeAnalyzer {

    private isStageFolder(name: string): boolean {
        return fs.existsSync(
            path.join(this.projectRoot, "stage", name)
        );
    }

    private isCharacterFolder(name: string): boolean {
        return fs.existsSync(
            path.join(this.projectRoot, "fighter", name)
        );
    }

        public analyze(folder: string): CrusadeNode[] {

        const entries = fs.readdirSync(folder, {
            withFileTypes: true
        });

        const stageNodes: CrusadeNode[] = [];
        const fighterNodes: CrusadeNode[] = [];
        const globalNodes: CrusadeNode[] = [];
        const looseNodes: CrusadeNode[] = [];

        for (const entry of entries) {

            const full = path.join(folder, entry.name);

            if (entry.isDirectory()) {

                // music/stage
                if (entry.name === "stage") {

                    stageNodes.push(
                        new CrusadeNode(
                            "Stages",
                            "folder",
                            vscode.TreeItemCollapsibleState.Collapsed,
                            full
                        )
                    );

                    continue;
                }

                // music/<fighter>
                if (this.isCharacterFolder(entry.name)) {

                    fighterNodes.push(
                        new CrusadeNode(
                            entry.name,
                            "folder",
                            vscode.TreeItemCollapsibleState.Collapsed,
                            full
                        )
                    );

                    continue;
                }

                // menu, css, online...
                globalNodes.push(
                    new CrusadeNode(
                        entry.name,
                        "folder",
                        vscode.TreeItemCollapsibleState.Collapsed,
                        full
                    )
                );

            }

            else if (/\.(ogg|mp3|wav)$/i.test(entry.name)) {

                looseNodes.push(
                    this.file(folder, entry.name)
                );

            }

        }

        const nodes: CrusadeNode[] = [];

        if (stageNodes.length) {

            nodes.push(new CrusadeNode(
                "🎮 Stage Music",
                "group",
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined,
                stageNodes
            ));

        }

        if (fighterNodes.length) {

            nodes.push(new CrusadeNode(
                "👤 Character Music",
                "group",
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined,
                fighterNodes
            ));

        }

        if (globalNodes.length) {

            nodes.push(new CrusadeNode(
                "🌐 Global Music",
                "group",
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined,
                globalNodes
            ));

        }

        if (looseNodes.length) {

            nodes.push(new CrusadeNode(
                "🎵 Loose Files",
                "group",
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined,
                looseNodes
            ));

        }

        return nodes;
    }

    /**
     * Musiques d'un stage
     * music/<stage>
     */
    public getStageMusic(stage: string): CrusadeNode | null {

        const dir = path.join(
            this.projectRoot,
            "music",
            "stage",
            stage
        );

        return this.musicFolder("🎵 Music", dir);

    }

    /**
     * Musiques d'un personnage
     * music/<fighter>
     */
    public getCharacterFolderMusic(character: string): CrusadeNode | null {

        const dir = path.join(
            this.projectRoot,
            "music",
            character
        );

        return this.musicFolder("🎵 Music", dir);

    }

    /**
     * Musiques Versus
     */
    public getCharacterVersusMusic(character: string): CrusadeNode | null {

        const dir = path.join(
            this.projectRoot,
            "music",
            "versus"
        );

        if (!fs.existsSync(dir)) {
            return null;
        }

        const lower = character.toLowerCase();

        const files = fs.readdirSync(dir)
            .filter(file => {

                if (!/\.(ogg|mp3|wav)$/i.test(file))
                    return false;

                const name = file.toLowerCase();

                return (
                    name.startsWith(lower + "_") ||
                    name.includes("_" + lower + "_") ||
                    name.includes("_" + lower + ".") ||
                    name.includes(lower + ".")
                );

            });

        if (!files.length) {
            return null;
        }

        return new CrusadeNode(
            "🎵 Versus Music",
            "group",
            vscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            files.map(f => this.file(dir, f))
        );

    }

    /**
     * Dossier de musiques quelconque
     */
    private musicFolder(
        label: string,
        dir: string
    ): CrusadeNode | null {

        if (!fs.existsSync(dir)) {
            return null;
        }

        const files = fs.readdirSync(dir)
            .filter(f =>
                /\.(ogg|mp3|wav)$/i.test(f)
            );

        if (!files.length) {
            return null;
        }

        return new CrusadeNode(
            label,
            "group",
            vscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            files.map(f => this.file(dir, f))
        );

    }

}