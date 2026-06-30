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
            vscode.l10n.t("Not a Crusade project. Open a folder with INDEX, fighter/, and stage/ directories.")
        );
        return;
    }

    // Prompt for character name
    const name = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Enter character name"),
        placeHolder: vscode.l10n.t("e.g., MyCharacter"),
        validateInput: (value: string) => {
            if (!value.trim()) {
                return vscode.l10n.t("Name cannot be empty");
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                return vscode.l10n.t("Name can only contain letters, numbers, underscores, and hyphens");
            }
            if (value.length > 32) {
                return vscode.l10n.t("Name cannot exceed 32 characters");
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

        const overwriteLabel = vscode.l10n.t("Overwrite");
        const cancelLabel = vscode.l10n.t("Cancel");

        const overwrite = await vscode.window.showWarningMessage(
            vscode.l10n.t('Character "{0}" already exists. Overwrite?', name),
            { modal: true },
            overwriteLabel,
            cancelLabel
        );

        if (overwrite !== overwriteLabel) {
            return;
        }

        // Remove existing directory
        try {
            fs.rmSync(fighterPath, { recursive: true, force: true });
        } catch (error) {
            notifications.error(vscode.l10n.t("Failed to remove existing character: {0}", String(error)));
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
                vscode.l10n.t("Character template not found in extension. Please reinstall.")
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
        notifications.info(vscode.l10n.t('Character "{0}" created successfully!', name));
        const info = await getDatInfo(workspace, name)
        if (!info) {
            notifications.warning(vscode.l10n.t("Character creation cancelled. Missing DAT info."));
            return;
        }
        await createDatFile(context, workspace, name, info);
        const id = await addCharacterToRoster(workspace, name);

        if (id !== undefined) {
            await ensureCssPageRegistered(workspace, "My-Mods.txt", "My-Mods");
            await addCharacterToCss(workspace, id);
        }

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
        notifications.error(vscode.l10n.t("Failed to create character: {0}", String(error)));
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

/**
 * Liste les franchises existantes (gfx/seriesicon/<nom>.png) dans une
 * liste déroulante, avec une option pour en saisir une nouvelle.
 */
async function pickSeriesName(workspace: WorkspaceService): Promise<string | undefined> {

    const seriesIconDir = path.join(workspace.gfx(), "seriesicon");

    const existing = fs.existsSync(seriesIconDir)
        ? fs.readdirSync(seriesIconDir)
            .filter(f => /\.(png|bmp|gif|jpg|jpeg)$/i.test(f))
            .map(f => path.basename(f, path.extname(f)))
            .sort((a, b) => a.localeCompare(b))
        : [];

    const createNewLabel = vscode.l10n.t("$(add) Create new franchise...");

    const choice = await vscode.window.showQuickPick(
        [createNewLabel, ...existing],
        { placeHolder: vscode.l10n.t("Select the character's franchise/series") }
    );

    if (choice === undefined) return;

    if (choice !== createNewLabel) return choice;

    return vscode.window.showInputBox({
        prompt: vscode.l10n.t("New franchise/series name"),
        placeHolder: vscode.l10n.t("e.g. Mario, Sonic...")
    });

}

interface DatInfo {
    cssName: string;
    menuName: string;
    battleName: string;
    seriesName: string;
    homeStage: string;
}

async function getDatInfo(workspace: WorkspaceService, name: string): Promise<DatInfo | undefined> {
    const cssName = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("CSS Name"),
        value: name
    });

    if (cssName === undefined) return;

    const menuName = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Menu Name"),
        value: name
    });

    if (menuName === undefined) return;

    const battleName = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Battle Name"),
        value: name
    });

    if (battleName === undefined) return;

    const seriesName = await pickSeriesName(workspace);

    if (seriesName === undefined) return;

    const homeStage = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Classic Home Stage"),
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
        notifications.error(vscode.l10n.t("DAT template not found."));
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

/**
 * Ajoute le personnage à fighters.txt et retourne son ID dans le roster
 * (= sa position dans la liste, utilisée comme ID CSS).
 */
async function addCharacterToRoster(
    workspace: WorkspaceService,
    name: string
): Promise<number | undefined> {
    try{
        const notifications = new NotificationService();
        const fighterlist = workspace.fightersList();

        if (!fs.existsSync(fighterlist)) {
            notifications.error(vscode.l10n.t("DAT template not found."));
            return undefined;
        }



        let listContent = fs.readFileSync(fighterlist, "utf8");

        const lines = listContent.split(/\r?\n/);

        let rostersize = parseInt(lines[0], 10);

        if (Number.isNaN(rostersize)) {
            notifications.error(vscode.l10n.t("Invalid fighters.txt format."));
            return undefined;
        }
        if(listContent.length - 1 > rostersize) {
            const oldsize = rostersize;
            rostersize = Number(listContent.replace(listContent[0], (listContent.length).toString()));
            notifications.info(vscode.l10n.t(
                "Roster size updated from {0} to {1} based on fighters.txt content.",
                oldsize,
                rostersize
            ));
        }
        if (listContent.includes(name)) {
            notifications.warning(vscode.l10n.t('Character "{0}" is already in the roster.', name));
            return undefined;
        }

        const id = rostersize + 1;

        listContent = listContent.replace(listContent[0], id.toString());
        listContent = listContent.concat(`\n${name}`);

        fs.writeFileSync(fighterlist, listContent, "utf8");

        notifications.info(vscode.l10n.t('Character "{0}" added to roster successfully!', name));

        return id;
    } catch (error) {
        const notifications = new NotificationService();
        notifications.error(vscode.l10n.t("Failed to add character to roster: {0}", String(error)));
        return undefined;
    }
}

/**
 * S'assure qu'une page CSS (ex: My-Mods.txt) existe et qu'elle est
 * enregistrée dans GAME_SETTINGS.txt (global.css_custom[...]),
 * sans quoi le jeu ne saura pas l'afficher comme onglet du CSS.
 */
async function ensureCssPageRegistered(
    workspace: WorkspaceService,
    fileName: string,
    displayName: string
): Promise<void> {

    const notifications = new NotificationService();

    // Crée le fichier de page CSS s'il n'existe pas encore
    const cssPage = path.join(workspace.cssFolder(), fileName);

    if (!fs.existsSync(cssPage)) {

        if (!fs.existsSync(workspace.cssFolder())) {
            fs.mkdirSync(workspace.cssFolder(), { recursive: true });
        }

        fs.writeFileSync(cssPage, "0000 0000 0000 0000 0000 0000 0000 0000\r\n", "utf8");

    }

    // Enregistre la page dans GAME_SETTINGS.txt si elle n'y est pas déjà
    const settingsPath = workspace.gameSettings();

    if (!fs.existsSync(settingsPath)) {
        notifications.warning(vscode.l10n.t("GAME_SETTINGS.txt not found, skipping CSS page registration."));
        return;
    }

    try {

        let content = fs.readFileSync(settingsPath, "utf8");

        if (content.includes(`css\\${fileName}`) || content.includes(`css/${fileName}`)) {
            return; // déjà enregistrée
        }

        const numberMatch = content.match(/global\.css_custom_number\s*=\s*(\d+)\s*;/);

        if (!numberMatch) {
            notifications.warning(vscode.l10n.t("Could not find global.css_custom_number in GAME_SETTINGS.txt."));
            return;
        }

        const currentNumber = parseInt(numberMatch[1], 10);
        const newNumber = currentNumber + 1;

        content = content.replace(
            numberMatch[0],
            `global.css_custom_number = ${newNumber};`
        );

        const newEntry =
            `global.css_custom[${newNumber}] = "css\\${fileName}";\r\n` +
            `global.css_custom_name[${newNumber}] = "${displayName}";`;

        const lastEntryRegex = new RegExp(
            `global\\.css_custom_name\\[${currentNumber}\\][^\\r\\n]*`
        );

        content = lastEntryRegex.test(content)
            ? content.replace(lastEntryRegex, match => `${match}\r\n${newEntry}`)
            : content.trimEnd().concat(`\r\n${newEntry}\r\n`);

        fs.writeFileSync(settingsPath, content, "utf8");

        notifications.info(vscode.l10n.t('Registered new CSS page "{0}" in GAME_SETTINGS.txt.', displayName));

    } catch (error) {
        notifications.error(vscode.l10n.t("Failed to register CSS page: {0}", String(error)));
    }

}

/**
 * Ajoute l'ID du personnage à la page CSS data/css/My-Mods.txt,
 * en remplaçant le premier emplacement vide (0000) disponible.
 */
async function addCharacterToCss(
    workspace: WorkspaceService,
    id: number
): Promise<void> {

    const notifications = new NotificationService();
    const cssPage = path.join(workspace.cssFolder(), "My-Mods.txt");

    if (!fs.existsSync(cssPage)) {
        notifications.warning(vscode.l10n.t("data/css/My-Mods.txt not found, skipping CSS placement."));
        return;
    }

    try {

        const code = id.toString().padStart(4, "0");

        let content = fs.readFileSync(cssPage, "utf8");

        if (content.includes("0000")) {
            content = content.replace("0000", code);
        } else {
            content = content.trimEnd().concat(` ${code}\n`);
        }

        fs.writeFileSync(cssPage, content, "utf8");

        notifications.info(vscode.l10n.t("Character added to CSS (My-Mods, ID {0}).", code));

    } catch (error) {
        notifications.error(vscode.l10n.t("Failed to add character to CSS: {0}", String(error)));
    }

}
