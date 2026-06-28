import * as fs from "fs";
import * as vscode from "vscode";
import { CrusadeAnalyzer } from "./CrusadeAnalyzer";
import { CrusadeNode } from "../explorer/CrusadeNode";
import * as path from "path";
import { MusicAnalyzer } from "./MusicAnalyser";

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
}