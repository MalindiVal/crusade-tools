import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { CrusadeAnalyzer } from "./CrusadeAnalyzer";
import { CrusadeNode } from "../explorer/CrusadeNode";
import { CharacterInitParser } from "../parcer/CharacterInitParser";
import { CharacterInitFile, InitEntry } from "../models/CharacterInitFile";

const SPRITE_FUNCTION = "cspr_add";

const STAT_KEYS = [
    "weight",
    "grav",
    "max_jumps",
    "jump_speed",
    "mid_jump_speed",
    "short_hop_speed",
    "airdash_speed",
    "jump_voice_freq",
    "mid_jump_voice_freq",
    "run_speed",
    "walk_speed",
    "dash_speed",
    "run_start_speed",
    "run_accel",
    "fric",
    "walkstopspeed",
    "air_speed",
    "fall_speed",
    "fast_fall_multiplier",
    "air_accel",
    "xsize",
    "ysize",
    "ability",
    "smash_power_gain",
    "smash_charge_sound"
];

export class InitAnalyzer extends CrusadeAnalyzer {

    analyze(folder: string): CrusadeNode[] {

        if(path.basename(folder) === "fighter"){
            return this.analyzeFighterInit(folder);
        } else if(path.basename(folder) === "stage"){
            return this.analyzeStageInit(folder);
        } else if(path.basename(folder) === "assist"){
            throw new Error("Assist init analysis is not implemented yet.");
            //return this.analyzeAssistInit(folder);
        }
        return [];
    }

    /**
     * Récupère les sprites déclarés via cspr_add(...) dans init.txt,
     * sous forme de noeuds fichier pointant vers les images correspondantes.
     */
    getSpriteGroup(folder: string): CrusadeNode | null {

        const initPath = path.join(folder, "init.txt");

        if (!fs.existsSync(initPath))
            return null;

        const init = CharacterInitParser.read(initPath);

        const children = this.extractSpriteEntries(init)
            .map(({ variable, spritePath }) => {
                const fullPath = path.join(this.projectRoot, spritePath);
                return this.spriteFileNode(variable, spritePath, fullPath);
            })
            .filter(node => fs.existsSync(node.fullPath!));

        if (children.length === 0)
            return null;

        return this.groupNode("🖼 Sprites (init.txt)", children);
    }

    /**
     * Récupère les stats de gameplay (weight, grav, vitesses...)
     * déclarées dans init.txt sous forme d'assignations simples.
     */
    getStats(folder: string): Record<string, string> {

        const initPath = path.join(folder, "init.txt");

        if (!fs.existsSync(initPath))
            return {};

        const init = CharacterInitParser.read(initPath);

        const stats: Record<string, string> = {};

        for (const section of init.sections) {
            for (const entry of section.entries) {
                if (
                    entry.type === "assignment" &&
                    STAT_KEYS.includes(entry.variable)
                ) {
                    stats[entry.variable] = entry.value;
                }
            }
        }

        return stats;
    }

    private spriteFileNode(
        variable: string,
        spritePath: string,
        fullPath: string
    ): CrusadeNode {

        const node = new CrusadeNode(
            `${variable} (${path.basename(spritePath)})`,
            "file",
            vscode.TreeItemCollapsibleState.None,
            fullPath
        );

        node.command = {
            command: "vscode.open",
            title: "Open",
            arguments: [
                vscode.Uri.file(fullPath)
            ]
        };

        return node;
    }

    private extractSpriteEntries(
        init: CharacterInitFile
    ): { variable: string; spritePath: string }[] {

        const entries: { variable: string; spritePath: string }[] = [];

        for (const section of init.sections) {
            for (const entry of section.entries) {
                if (
                    entry.type === "function" &&
                    entry.function === SPRITE_FUNCTION &&
                    entry.variable &&
                    entry.args.length > 0
                ) {
                    entries.push({
                        variable: entry.variable,
                        spritePath: entry.args[0]
                    });
                }
            }
        }

        return entries;
    }

    private analyzeFighterInit(folder: string): CrusadeNode[] {
        const initPath = path.join(folder, "init.txt");

        const init = CharacterInitParser.read(initPath);

        return init.sections.map(section => ({
            label: section.name,
            collapsibleState: section.entries.length > 0
                ? 1
                : 0,
            children: section.entries.map(entry => ({
                label: this.getEntryLabel(entry)
            }))
        }) as CrusadeNode);
    }

    private analyzeStageInit(folder: string): CrusadeNode[] {
        const initPath = path.join(folder, "scr_init.txt");

        const init = CharacterInitParser.read(initPath);

        return init.sections.map(section => ({
            label: section.name,
            collapsibleState: section.entries.length > 0
                ? 1
                : 0,
            children: section.entries.map(entry => ({
                label: this.getEntryLabel(entry)
            }))
        }) as CrusadeNode);
    }

    private getEntryLabel(entry: InitEntry): string {

        switch (entry.type) {

            case "function":
                return entry.variable
                    ? `${entry.variable} = ${entry.function}()`
                    : `${entry.function}()`;

            case "assignment":
                return `${entry.variable} = ${entry.value}`;

            case "raw":
            default:
                return entry.raw;

        }

    }

}