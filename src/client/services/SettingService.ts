import * as vscode from "vscode";

export class SettingsService {

    private static readonly SECTION = "crusade-tools";

    private get configuration(): vscode.WorkspaceConfiguration {

        return vscode.workspace.getConfiguration(
            SettingsService.SECTION
        );

    }

    // -------------------------
    // Général
    // -------------------------

    public autoWatch(): boolean {

        return this.configuration.get(
            "autoWatch",
            true
        );

    }

    public setAutoWatch(value: boolean): Thenable<void> {

        return this.configuration.update(
            "autoWatch",
            value,
            vscode.ConfigurationTarget.Workspace
        );

    }

    // -------------------------
    // Jeu
    // -------------------------

    public gamePath(): string {

        return this.configuration.get(
            "gamePath",
            ""
        );

    }

    public setGamePath(path: string): Thenable<void> {

        return this.configuration.update(
            "gamePath",
            path,
            vscode.ConfigurationTarget.Workspace
        );

    }

    // -------------------------
    // Explorer
    // -------------------------

    public showHiddenFiles(): boolean {

        return this.configuration.get(
            "showHiddenFiles",
            false
        );

    }

    public explorerCompactMode(): boolean {

        return this.configuration.get(
            "compactExplorer",
            true
        );

    }

    public sortAlphabetically(): boolean {

        return this.configuration.get(
            "sortAlphabetically",
            true
        );

    }

    // -------------------------
    // Diagnostics
    // -------------------------

    public enableDiagnostics(): boolean {

        return this.configuration.get(
            "diagnostics",
            true
        );

    }

    public enableLogWatcher(): boolean {

        return this.configuration.get(
            "watchLogs",
            true
        );

    }

    // -------------------------
    // Preview
    // -------------------------

    public previewSprites(): boolean {

        return this.configuration.get(
            "previewSprites",
            true
        );

    }

    public previewMusic(): boolean {

        return this.configuration.get(
            "previewMusic",
            true
        );

    }

    public previewStages(): boolean {

        return this.configuration.get(
            "previewStages",
            true
        );

    }

    // -------------------------
    // Compiler
    // -------------------------

    public compilerPath(): string {

        return this.configuration.get(
            "compilerPath",
            ""
        );

    }

    public useIncrementalCompile(): boolean {

        return this.configuration.get(
            "incrementalCompile",
            true
        );

    }

}