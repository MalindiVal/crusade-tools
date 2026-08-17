import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";

import { createCharacter } from "./character/createCharacter";
import { SettingsService } from "../services/SettingService";
import { NotificationService } from "../services/NotificationService";

export class CommandRegistry {

    private readonly settings = new SettingsService();
    private readonly notifications = new NotificationService();

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public register(): void {

        this.registerCommand(
            "crusade-tools.createCharacter",
            () => createCharacter(this.context)
        );

        this.registerCommand(
            "crusade-tools.openGame",
            () => this.launchGame()
        );

        this.registerCommand(
            "crusade-tools.compileCharacter",
            (node) => {
                vscode.window.showInformationMessage(
                    vscode.l10n.t("Compile {0} (TODO)", node?.label ?? "")
                );
            }
        );

        // Preview commands are registered by PreviewManager
        // Do NOT register them here - they're handled by individual Preview classes

        this.registerCommand(
            "crusade-tools.toggleWatch",
            () => {
                vscode.window.showInformationMessage(
                    vscode.l10n.t("Toggle Log Watch (TODO)")
                );
            }
        );

        this.registerCommand(
            "crusade-tools.clearLogs",
            () => {
                vscode.window.showInformationMessage(
                    vscode.l10n.t("Clear Logs (TODO)")
                );
            }
        );

        this.registerCommand(
            "crusade-tools.openErrorLog",
            () => {
                vscode.window.showInformationMessage(
                    vscode.l10n.t("Open error.log (TODO)")
                );
            }
        );

    }

    private async launchGame(): Promise<void> {

        let gamePath = this.settings.gamePath();

        if (!gamePath) {
            gamePath = await this.promptForGamePath() ?? "";
        }

        if (!gamePath) {
            return;
        }

        if (!fs.existsSync(gamePath)) {
            this.notifications.error(
                vscode.l10n.t("Game executable not found: {0}", gamePath)
            );
            return;
        }

        try {

            spawn(gamePath, [], {
                cwd: path.dirname(gamePath),
                detached: true,
                stdio: "ignore"
            }).unref();

        } catch (error) {
            this.notifications.error(
                vscode.l10n.t("Failed to launch Smash Crusade: {0}", String(error))
            );
        }

    }

    private async promptForGamePath(): Promise<string | undefined> {

        const browseLabel = vscode.l10n.t("Browse...");
        const openSettingsLabel = vscode.l10n.t("Open Settings");

        const choice = await vscode.window.showWarningMessage(
            vscode.l10n.t("The path to the Smash Crusade executable is not configured."),
            browseLabel,
            openSettingsLabel
        );

        if (choice === openSettingsLabel) {
            await vscode.commands.executeCommand(
                "workbench.action.openSettings",
                "crusade-tools.gamePath"
            );
            return undefined;
        }

        if (choice !== browseLabel) {
            return undefined;
        }

        const selection = await vscode.window.showOpenDialog({
            title: vscode.l10n.t("Select the Smash Crusade executable"),
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                "Executable": ["exe"],
                "All Files": ["*"]
            }
        });

        const picked = selection?.[0]?.fsPath;

        if (!picked) {
            return undefined;
        }

        await this.settings.setGamePath(picked);

        return picked;

    }

    private registerCommand(
        id: string,
        callback: (...args: any[]) => any
    ): void {

        this.context.subscriptions.push(

            vscode.commands.registerCommand(
                id,
                callback
            )

        );

    }

}