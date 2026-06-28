import * as fs from "fs";
import * as path from "path";

import { WorkspaceService } from "./WorkspaceService";

export class ProjectService {

    constructor(
        private readonly workspace: WorkspaceService
    ) {}

    // --------------------------------------------------
    // Project
    // --------------------------------------------------

    public exists(): boolean {

        return this.workspace.isCrusadeProject();

    }

    public root(): string {

        return this.workspace.getRoot();

    }

    // --------------------------------------------------
    // Fighters
    // --------------------------------------------------

    public fighters(): string[] {

        return this.directories(
            this.workspace.fighters()
        );

    }

    public fighter(name: string): string {

        return this.workspace.fighter(name);

    }

    public fighterExists(name: string): boolean {

        return fs.existsSync(
            this.fighter(name)
        );

    }

    // --------------------------------------------------
    // Stages
    // --------------------------------------------------

    public stages(): string[] {

        return this.directories(
            this.workspace.stages()
        );

    }

    public stage(name: string): string {

        return this.workspace.stage(name);

    }

    // --------------------------------------------------
    // Items
    // --------------------------------------------------

    public items(): string[] {

        return this.directories(
            this.workspace.items()
        );

    }

    // --------------------------------------------------
    // Palettes
    // --------------------------------------------------

    public palettes(): string[] {

        return this.directories(
            this.workspace.palettes()
        );

    }

    // --------------------------------------------------
    // Music
    // --------------------------------------------------

    public musics(): string[] {

        return this.directories(
            this.workspace.music()
        );

    }

    public stageMusic(stage: string): string {

        return this.workspace.musicFolder(stage);

    }

    public fighterMusic(fighter: string): string {

        return this.workspace.musicFolder(fighter);

    }

    // --------------------------------------------------
    // Generic
    // --------------------------------------------------

    public directoryExists(folder: string): boolean {

        return fs.existsSync(folder);

    }

    public files(folder: string): string[] {

        if (!fs.existsSync(folder)) {
            return [];
        }

        return fs.readdirSync(folder);

    }

    public directories(folder: string): string[] {

        if (!fs.existsSync(folder)) {
            return [];
        }

        return fs.readdirSync(folder, {
            withFileTypes: true
        })
        .filter(f => f.isDirectory())
        .map(f => f.name)
        .sort();

    }

}