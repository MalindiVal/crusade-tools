import * as fs from "fs";
import * as vscode from "vscode";
import { CrusadeAnalyzer } from "./CrusadeAnalyzer";
import { CrusadeNode } from "../explorer/CrusadeNode";
import * as path from "path";
import { MusicAnalyzer } from "./MusicAnalyzer";
import { InitAnalyzer } from "./InitAnalyzer";
import { DataAnalyzer } from "./DataAnalyzer";

export class FighterAnalyzer extends CrusadeAnalyzer {

    private readonly musicAnalyzer: MusicAnalyzer;
    private readonly initAnalyzer: InitAnalyzer;
    private readonly dataAnalyzer: DataAnalyzer;

    constructor(projectRoot: string) {
        super(projectRoot);
        this.musicAnalyzer = new MusicAnalyzer(projectRoot);
        this.initAnalyzer = new InitAnalyzer(projectRoot);
        this.dataAnalyzer = new DataAnalyzer(projectRoot);
    }

    analyze(folder: string): CrusadeNode[] {

        const files = fs.readdirSync(folder);
        const characterName = path.basename(folder);
        
        return [

            ...this.initAnalyzer.analyze(folder),
            this.dataAnalyzer.getDataNode(folder),
            this.group("⚙ Configuration", files, folder, [
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

            this.binGroup(characterName),

            this.portraitGroup(characterName),

            this.initAnalyzer.getSpriteGroup(folder),

            this.paletteGroup(folder),

            this.musicAnalyzer.getCharacterFolderMusic(characterName),
            this.musicAnalyzer.getCharacterVersusMusic(characterName)

        ].filter((n): n is CrusadeNode =>
            n !== null &&
            (!n.children || n.children.length > 0)
        );
    }

    /**
     * Récupère le script compilé fighter/<nom>.bin, situé à côté
     * du dossier source du personnage plutôt qu'à l'intérieur.
     */
    private binGroup(characterName: string): CrusadeNode | null {

        const fightersDir = path.join(this.projectRoot, "fighter");
        const binFile = `${characterName}.bin`;

        if (!fs.existsSync(path.join(fightersDir, binFile)))
            return null;

        return this.category("🗄 Compiled Script", [binFile], fightersDir);
    }

    /**
     * Récupère les portraits (gfx/portrait) et icônes de stock (gfx/stock)
     * d'un personnage, stockés à la racine du projet plutôt que dans
     * son dossier fighter/.
     */
    private portraitGroup(characterName: string): CrusadeNode | null {

        const portraitDir = path.join(this.projectRoot, "gfx", "portrait");
        const stockDir = path.join(this.projectRoot, "gfx", "stock");

        const portraits = this.matchingImageFiles(portraitDir, characterName);
        const icons = this.matchingImageFiles(stockDir, characterName);

        const children: CrusadeNode[] = [];

        if (portraits.length > 0)
            children.push(this.category("🖼 Portraits", portraits, portraitDir));

        if (icons.length > 0)
            children.push(this.category("🔘 Icônes", icons, stockDir));

        if (children.length === 0)
            return null;

        return this.groupNode("🎴 Portraits & Icônes", children);
    }

    private matchingImageFiles(dir: string, characterName: string): string[] {

        if (!fs.existsSync(dir))
            return [];

        const lower = characterName.toLowerCase();

        return fs.readdirSync(dir)
            .filter(f => /\.(png|bmp|gif|jpg|jpeg)$/i.test(f))
            .filter(f => f.toLowerCase().startsWith(lower));
    }
}