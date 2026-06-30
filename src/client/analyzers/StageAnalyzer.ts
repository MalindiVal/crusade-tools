import * as fs from "fs";
import * as vscode from "vscode";
import { CrusadeAnalyzer } from "./CrusadeAnalyzer";
import { CrusadeNode } from "../explorer/CrusadeNode";
import * as path from "path";
import { MusicAnalyzer } from "./MusicAnalyzer";

export class StageAnalyzer extends CrusadeAnalyzer {

    private readonly musicAnalyzer: MusicAnalyzer;
    constructor(projectRoot: string) {
        super(projectRoot);
        this.musicAnalyzer = new MusicAnalyzer(projectRoot);
    }

    analyze(folder: string): CrusadeNode[] {

        const files = fs.readdirSync(folder);

        const stageName = path.basename(folder);

        return [

            this.dataNode(folder),

            this.category(
                "📜 Scripts",
                files.filter(f => f.startsWith("scr_")),
                folder
            ),

            this.category(
                "🖼 Backgrounds",
                files.filter(f => f.startsWith("bg")),
                folder
            ),

            this.category(
                "📦 Collision",
                files.filter(f => (f.startsWith("box_") || f.endsWith("mask"))),
                folder
            ),

            this.spriteGroup(folder),

            this.musicAnalyzer.getStageMusic(stageName)

        ].filter((n): n is CrusadeNode =>
            n !== null &&
            (!n.children || n.children.length > 0)
        );
    }

    /**
     * Noeud "Données" d'un stage, donnant accès à la page de preview
     * (icône CSS gfx/stgicons, screenshot gfx/stgprevs).
     */
    private dataNode(folder: string): CrusadeNode {

        const node = new CrusadeNode(
            "📋 Données",
            "file",
            vscode.TreeItemCollapsibleState.None,
            folder
        );

        node.command = {
            command: "crusade-tools.previewStageData",
            title: "Preview Stage Data",
            arguments: [vscode.Uri.file(folder)]
        };

        return node;
    }
}