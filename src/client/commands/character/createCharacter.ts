import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { WorkspaceService } from "../../services/WorkspaceService";
import { NotificationService } from "../../services/NotificationService";

/**
 * Create a new character by cloning the template
 */
export async function createCharacter(
    context: vscode.ExtensionContext
): Promise<void> {

    const workspace = new WorkspaceService();
    const notifications = new NotificationService();

    // Validate workspace
    if (!workspace.isCrusadeProject()) {
        notifications.error(
            "Not a Crusade project. Open a folder with INDEX, fighter/, and stage/ directories."
        );
        return;
    }

    // Prompt for character name
    const name = await vscode.window.showInputBox({
        prompt: "Enter character name",
        placeHolder: "e.g., MyCharacter",
        validateInput: (value: string) => {
            if (!value.trim()) {
                return "Name cannot be empty";
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                return "Name can only contain letters, numbers, underscores, and hyphens";
            }
            if (value.length > 32) {
                return "Name cannot exceed 32 characters";
            }
            return null;
        }
    });

    if (!name) {
        return; // User cancelled
    }

    const fighterPath = workspace.fighter(name);

    // Check if character already exists
    if (fs.existsSync(fighterPath)) {
        const overwrite = await vscode.window.showWarningMessage(
            `Character "${name}" already exists. Overwrite?`,
            { modal: true },
            "Overwrite",
            "Cancel"
        );

        if (overwrite !== "Overwrite") {
            return;
        }

        // Remove existing directory
        try {
            fs.rmSync(fighterPath, { recursive: true, force: true });
        } catch (error) {
            notifications.error(`Failed to remove existing character: ${error}`);
            return;
        }
    }

    try {
        // Get template path from extension context
        const templatePath = path.join(
            context.extensionPath,
            "template",
            "fighter"
        );

        // Verify template exists
        if (!fs.existsSync(templatePath)) {
            notifications.error(
                "Character template not found in extension. Please reinstall."
            );
            return;
        }

        // Create character directory
        fs.mkdirSync(fighterPath, { recursive: true });

        // Copy template files
        await copyDirectory(templatePath, fighterPath);

        // Show success notification
        notifications.info(`Character "${name}" created successfully!`);

        // Open character folder in explorer
        const uri = vscode.Uri.file(fighterPath);
        await vscode.commands.executeCommand(
            "revealFileInOS",
            uri
        );

        // Open init.txt for editing
        const initFile = path.join(fighterPath, "init.txt");
        if (fs.existsSync(initFile)) {
            const document = await vscode.workspace.openTextDocument(initFile);
            await vscode.window.showTextDocument(document);
        }

    } catch (error) {
        notifications.error(`Failed to create character: ${error}`);
    }

}

/**
 * Recursively copy a directory and all its contents
 */
async function copyDirectory(src: string, dest: string): Promise<void> {

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {

            fs.mkdirSync(destPath, { recursive: true });
            await copyDirectory(srcPath, destPath);

        } else {

            fs.copyFileSync(srcPath, destPath);

        }

    }

}