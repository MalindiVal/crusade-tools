import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { CrusadeNode } from "../explorer/CrusadeNode";
import { CrusadeAnalyzer } from "./CrusadeAnalyzer";

export class DataAnalyzer extends CrusadeAnalyzer {

    analyze(folder: string): CrusadeNode[] {
        return [];
    }

    /**
     * Noeud "Données" d'un personnage (fighter/<nom>), donnant accès
     * à la page de données issues du .dat et des stats du init.txt.
     */
    getDataNode(folder: string): CrusadeNode | null {

        const characterName = path.basename(folder);
        const datPath = path.join(this.projectRoot, "data", "dats", `${characterName}.dat`);
        const initPath = path.join(folder, "init.txt");

        if (!fs.existsSync(datPath) && !fs.existsSync(initPath))
            return null;

        const node = new CrusadeNode(
            "📋 Données",
            "file",
            vscode.TreeItemCollapsibleState.None,
            folder
        );

        node.command = {
            command: "crusade-tools.previewCharacterData",
            title: "Preview Character Data",
            arguments: [vscode.Uri.file(folder)]
        };

        return node;
    }
}