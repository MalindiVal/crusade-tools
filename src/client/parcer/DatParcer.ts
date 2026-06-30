import * as fs from "fs";
import { CharacterDat } from "../models/CharacterDat";
import { Palette } from "../models/Palette";

const HOME_STAGES_MARKER = "---Classic Home Stages Below---";
const PALETTES_NUMBER_MARKER = "---Palettes Number---";
const PALETTES_DATA_MARKER = "---From Here is Individual Palettes data---";

export class DatParcer {

    public static read(file: string): CharacterDat {

        const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

        const cssName = lines[0] ?? "";
        const menuName = lines[1] ?? "";
        const battleName = lines[2] ?? "";
        const seriesName = lines[3] ?? "";

        const homeStages = DatParcer.readHomeStages(lines);
        const palettes = DatParcer.readPalettes(lines);

        return {
            cssName,
            menuName,
            battleName,
            seriesName,
            homeStages,
            palettes
        };
    }

    public static write(file: string, data: CharacterDat): void {

        const lines: string[] = [
            data.cssName,
            data.menuName,
            data.battleName,
            data.seriesName,
            HOME_STAGES_MARKER,
            data.homeStages.length.toString(),
            ...data.homeStages,
            "---Random Datas---",
            "0",
            PALETTES_NUMBER_MARKER,
            data.palettes.length.toString(),
            PALETTES_DATA_MARKER
        ];

        for (const palette of data.palettes) {
            lines.push(
                palette.name,
                palette.color.toString(),
                palette.mode.toString(),
                palette.hue.toString(),
                palette.saturation.toString(),
                palette.brightness.toString()
            );
        }

        fs.writeFileSync(file, lines.join("\r\n"), "utf8");

    }

    private static readHomeStages(lines: string[]): string[] {

        const markerIndex = lines.findIndex(l => l.trim() === HOME_STAGES_MARKER);

        if (markerIndex === -1)
            return [];

        const count = parseInt(lines[markerIndex + 1], 10) || 0;

        return lines.slice(
            markerIndex + 2,
            markerIndex + 2 + count
        );

    }

    private static readPalettes(lines: string[]): Palette[] {

        const countMarkerIndex = lines.findIndex(l => l.trim() === PALETTES_NUMBER_MARKER);
        const dataMarkerIndex = lines.findIndex(l => l.trim() === PALETTES_DATA_MARKER);

        if (countMarkerIndex === -1 || dataMarkerIndex === -1)
            return [];

        const count = parseInt(lines[countMarkerIndex + 1], 10) || 0;

        const palettes: Palette[] = [];

        let cursor = dataMarkerIndex + 1;

        for (let i = 0; i < count; i++) {

            const name = (lines[cursor++] ?? "").trim();
            const color = parseFloat(lines[cursor++]) || 0;
            const mode = parseFloat(lines[cursor++]) || 0;
            const hue = parseFloat(lines[cursor++]) || 0;
            const saturation = parseFloat(lines[cursor++]) || 0;
            const brightness = parseFloat(lines[cursor++]) || 0;

            palettes.push({ name, color, mode, hue, saturation, brightness });

        }

        return palettes;

    }

}
