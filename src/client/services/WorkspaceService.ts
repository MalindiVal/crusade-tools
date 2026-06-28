import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class WorkspaceService {

    private readonly root: string;

    constructor() {

        const workspace = vscode.workspace.workspaceFolders?.[0];

        if (!workspace) {
            throw new Error("No workspace opened.");
        }

        this.root = workspace.uri.fsPath;

    }

    public getRoot(): string {
        return this.root;
    }

    public exists(relative: string): boolean {
        return fs.existsSync(
            path.join(this.root, relative)
        );
    }

    public resolve(...segments: string[]): string {
        return path.join(
            this.root,
            ...segments
        );
    }

    // -----------------------
    // Crusade folders
    // -----------------------

    public fighters(): string {
        return this.resolve("fighter");
    }

    public stages(): string {
        return this.resolve("stage");
    }

    public items(): string {
        return this.resolve("item");
    }

    public music(): string {
        return this.resolve("music");
    }

    public palettes(): string {
        return this.resolve("palettes");
    }

    public assists(): string {
        return this.resolve("assists");
    }

    public story(): string {
        return this.resolve("story");
    }

    public enemy(): string {
        return this.resolve("enemy");
    }

    public challenge(): string {
        return this.resolve("challenge");
    }

    public cutscenes(): string {
        return this.resolve("cutscenes");
    }

    public gfx(): string {
        return this.resolve("gfx");
    }

    public sfx(): string {
        return this.resolve("sfx");
    }

    public data(): string {
        return this.resolve("data");
    }

    // -----------------------
    // Resources
    // -----------------------

    public fighter(name: string): string {
        return path.join(
            this.fighters(),
            name
        );
    }

    public stage(name: string): string {
        return path.join(
            this.stages(),
            name
        );
    }

    public item(name: string): string {
        return path.join(
            this.items(),
            name
        );
    }

    public palette(name: string): string {
        return path.join(
            this.palettes(),
            name
        );
    }

    public musicFolder(name: string): string {
        return path.join(
            this.music(),
            name
        );
    }

    public dats(): string {
        return path.join(this.root, "data", "dats");
    }

    // -----------------------
    // Files
    // -----------------------

    public index(): string {
        return this.resolve("INDEX");
    }

    public errorLog(): string {
        return this.resolve("error.log");
    }

    public spriteCountLog(): string {
        return this.resolve("spritecount.log");
    }

    public settings(): string {
        return this.resolve("settings.ini");
    }

    public controls(): string {
        return this.resolve("controls.ini");
    }

    public fightersList(): string {
        return this.resolve("data", "fighters.txt");
    }

    // -----------------------
    // Helpers
    // -----------------------

    public isCrusadeProject(): boolean {

        return [

            "data",
            "fighter",
            "stage",
            "item",
            "music",
            "INDEX"

        ].every(file => this.exists(file));

    }

}