import { Palette } from "./Palette";

export interface CharacterDat {
    cssName: string;
    menuName: string;
    battleName: string;
    seriesName: string;

    homeStages: string[];

    palettes: Palette[];
}