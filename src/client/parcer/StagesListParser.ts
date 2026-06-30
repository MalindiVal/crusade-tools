import * as fs from "fs";
import { StageInfo } from "../models/StageInfo";

export class StagesListParser {

    /**
     * data/stages.txt: une première ligne avec le nombre de stages,
     * puis des blocs de 4 lignes par stage :
     * id interne, nom affiché, nom de la franchise, code de franchise
     * (qui correspond à gfx/seriesicon/<code>.png).
     */
    public static read(file: string): StageInfo[] {

        const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

        const count = parseInt(lines[0], 10) || 0;

        const stages: StageInfo[] = [];

        let cursor = 1;

        for (let i = 0; i < count; i++) {

            const id = lines[cursor++];

            if (id === undefined)
                break;

            stages.push({
                id,
                displayName: lines[cursor++] ?? id,
                seriesName: lines[cursor++] ?? "",
                seriesCode: lines[cursor++] ?? ""
            });

        }

        return stages;

    }

    /**
     * Cherche les infos d'un stage par son id interne (nom du dossier
     * ou du fichier .bin dans stage/).
     */
    public static find(file: string, stageId: string): StageInfo | undefined {

        if (!fs.existsSync(file))
            return undefined;

        return StagesListParser.read(file)
            .find(s => s.id === stageId);

    }

}
