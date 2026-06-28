import * as fs from "fs";
import * as vscode from "vscode";
import { CrusadeAnalyzer } from "./CrusadeAnalyzer";
import { CrusadeNode } from "../explorer/crusadeNode";
import path from "path/win32";
import { MusicAnalyzer } from "./MusicAnalyser";

export class FighterAnalyzer extends CrusadeAnalyzer {

    private readonly musicAnalyzer: MusicAnalyzer;
    constructor(projectRoot: string) {
        super(projectRoot);
        this.musicAnalyzer = new MusicAnalyzer(projectRoot);
    }

    analyze(folder: string): CrusadeNode[] {

        const files = fs.readdirSync(folder);
        const characterName = path.basename(folder);
        
        return [

            this.group("⚙ Configuration", files, folder, [
                "init.txt",
                "ai.txt"
            ]),

            this.group("⚔ Attacks", files, folder, [
                "jab.txt",
                "utilt.txt",
                "dtilt.txt",
                "stilt.txt",
                "dash_attack.txt"
            ]),

            this.group("🥋 Aerials", files, folder, [
                "fair.txt",
                "bair.txt",
                "uair.txt",
                "dair.txt",
                "nair.txt",
                "zair.txt"
            ]),

            this.group("Custom Scripts", files, folder, [
                "c1.txt",
                "c2.txt",
                "c3.txt",
                "c4.txt",
                "c5.txt",
                "c6.txt",
                "c7.txt",
                "c8.txt",
                "c9.txt",
                "c10.txt",
                "c11.txt",
                "c12.txt",
        ]),

            this.group("💥 Smashes", files, folder, [
                "usmash.txt",
                "ssmash.txt",
                "dsmash.txt"
            ]),

            this.group("🪄 Specials", files, folder, [
                "b.txt",
                "sideb.txt",
                "upb.txt",
                "downb.txt",
                "final_smash.txt"
            ]),

            this.group("🪄 Alternate Specials", files, folder, [
                "ab.txt",
                "sab.txt",
                "uab.txt",
                "dab.txt",
            ]),

            this.group("🤼 Throws", files, folder, [
                "grab.txt",
                "hold.txt",
                "fthrow.txt",
                "bthrow.txt",
                "uthrow.txt",
                "dthrow.txt"
            ]),

            this.group("🎭 Misc", files, folder, [
                "entry.txt",
                "taunt.txt",
                "win.txt",
                "lose.txt",
                "result.txt",
                "step.txt",
                "edge_attack.txt",
                "glide_attack.txt"
            ]),

            this.folder(folder, "gfx"),
            this.folder(folder, "sfx"),

            this.spriteGroup(folder),

            this.paletteGroup(folder),

            this.musicAnalyzer.getCharacterFolderMusic(characterName),
            this.musicAnalyzer.getCharacterVersusMusic(characterName)

        ].filter((n): n is CrusadeNode =>
            n !== null &&
            (!n.children || n.children.length > 0)
        );
    }
}