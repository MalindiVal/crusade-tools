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

        // Replace template character name in init.txt
        const initFile = path.join(fighterPath, "init.txt");

        if (fs.existsSync(initFile)) {
            let content = fs.readFileSync(initFile, "utf8");

            // Replace every occurrence of "rika" (case-insensitive)
            content = content.replace(/rika/gi, name);

            fs.writeFileSync(initFile, content, "utf8");
        }

        // Show success notification
        notifications.info(`Character "${name}" created successfully!`);
        const info =await getDatInfo(name)
        if (!info) {
            notifications.warning("Character creation cancelled. Missing DAT info.");
            return;
        }
        await createDatFile(context, workspace, name, info);
        await addCharacterToRoster(workspace, name);

        // Open character folder in explorer
        const uri = vscode.Uri.file(fighterPath);
        await vscode.commands.executeCommand(
            "revealFileInOS",
            uri
        );

        // Open init.txt for editing
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

interface DatInfo {
    cssName: string;
    menuName: string;
    battleName: string;
    seriesName: string;
    homeStage: string;
}

async function getDatInfo(name: string): Promise<DatInfo | undefined> {
    const cssName = await vscode.window.showInputBox({
        prompt: "CSS Name",
        value: name
    });

    if (cssName === undefined) return;

    const menuName = await vscode.window.showInputBox({
        prompt: "Menu Name",
        value: name
    });

    if (menuName === undefined) return;

    const battleName = await vscode.window.showInputBox({
        prompt: "Battle Name",
        value: name
    });

    if (battleName === undefined) return;

    const seriesName = await vscode.window.showInputBox({
        prompt: "Series Name",
        placeHolder: "e.g. Mario, Sonic..."
    });

    if (seriesName === undefined) return;

    const homeStage = await vscode.window.showInputBox({
        prompt: "Classic Home Stage",
        value: "suguri_sky"
    });

    if (homeStage === undefined) return;

    return {
    cssName,
    menuName,
    battleName,
    seriesName,
    homeStage
};
}

async function createDatFile(
    context: vscode.ExtensionContext,
    workspace: WorkspaceService,
    name: string,
    info: DatInfo
): Promise<void> {
    const datTemplate = path.join(
        context.extensionPath,
        "template",
        "data",
        "template.dat"
    );
    const notifications = new NotificationService();
    const datFolder = workspace.dats();
    const datFile = path.join(datFolder, `${name}.dat`);

    if (!fs.existsSync(datFolder)) {
        fs.mkdirSync(datFolder, { recursive: true });
    }

    if (!fs.existsSync(datTemplate)) {
        notifications.error("DAT template not found.");
        return;
    }

    let datContent = fs.readFileSync(datTemplate, "utf8");

    // Replace placeholders
    datContent = datContent
    .replace(/\{\{CSS_NAME\}\}/g, info.cssName)
    .replace(/\{\{MENU_NAME\}\}/g, info.menuName)
    .replace(/\{\{BATTLE_NAME\}\}/g, info.battleName)
    .replace(/\{\{SERIES_NAME\}\}/g, info.seriesName)
    .replace(/\{\{HOME_STAGE\}\}/g, info.homeStage);

    fs.writeFileSync(datFile, datContent, "utf8");
    
}

async function addCharacterToRoster(
    workspace: WorkspaceService,
    name: string
): Promise<void> {
    try{
        const notifications = new NotificationService();
        const fighterlist = workspace.fightersList();

        if (!fs.existsSync(fighterlist)) {
            notifications.error("DAT template not found.");
            return;
        }

        

        let listContent = fs.readFileSync(fighterlist, "utf8");

        const lines = listContent.split(/\r?\n/);

        let rostersize = parseInt(lines[0], 10);

        if (Number.isNaN(rostersize)) {
            notifications.error("Invalid fighters.txt format.");
            return;
        }
        if(listContent.length - 1 > rostersize) {
            const oldsize = rostersize;
            rostersize = Number(listContent.replace(listContent[0], (listContent.length).toString()));
            notifications.info(`Roster size updated from ${oldsize} to ${rostersize} based on fighters.txt content.`);
        }
        if (listContent.includes(name)) {
            notifications.warning(`Character "${name}" is already in the roster.`);
            return;
        }
        listContent = listContent.replace(listContent[0], (rostersize + 1).toString());
        listContent = listContent.concat(`\n${name}`);

        fs.writeFileSync(fighterlist, listContent, "utf8");

        notifications.info(`Character "${name}" added to roster successfully!`);
    } catch (error) {
        const notifications = new NotificationService();
        notifications.error(`Failed to add character to roster: ${error}`);
    }
}