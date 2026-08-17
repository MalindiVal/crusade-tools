import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { DatParcer } from "../parcer/DatParcer";
import { InitAnalyzer } from "../analyzers/InitAnalyzer";
import { CharacterDat } from "../models/CharacterDat";

const IMAGE_EXTENSIONS = /\.(png|bmp|gif|jpg|jpeg)$/i;
const AUDIO_EXTENSIONS = /\.(ogg|mp3|wav)$/i;

export class CharacterDataPreview implements vscode.Disposable {

    private panel?: vscode.WebviewPanel;
    private currentUri?: vscode.Uri;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public register(): void {

        this.context.subscriptions.push(

            vscode.commands.registerCommand(

                "crusade-tools.previewCharacterData",

                (uri: vscode.Uri) => this.open(uri)

            )

        );

    }

    private open(uri: vscode.Uri): void {

        this.currentUri = uri;

        const projectRoot = this.projectRoot(uri);

        if (this.panel) {

            this.panel.reveal(vscode.ViewColumn.Beside);

            this.update(uri);

            return;

        }

        this.panel = vscode.window.createWebviewPanel(

            "crusadeCharacterDataPreview",

            vscode.l10n.t("Data - {0}", this.characterName(uri)),

            vscode.ViewColumn.Beside,

            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(projectRoot)
                ]
            }

        );

        this.panel.onDidDispose(() => {

            this.panel = undefined;

        });

        this.panel.webview.onDidReceiveMessage(
            message => this.handleMessage(message)
        );

        this.update(uri);

    }

    private async handleMessage(message: { type: string; path?: string }): Promise<void> {

        if (message.type !== "deleteMusic" || !message.path || !this.currentUri) {
            return;
        }

        const filePath = message.path;
        const projectRoot = this.projectRoot(this.currentUri);
        const relative = path.relative(projectRoot, filePath);

        if (relative.startsWith("..") || path.isAbsolute(relative)) {
            return;
        }

        const deleteLabel = vscode.l10n.t("Delete");

        const confirm = await vscode.window.showWarningMessage(
            vscode.l10n.t('Delete "{0}"?', path.basename(filePath)),
            { modal: true },
            deleteLabel
        );

        if (confirm !== deleteLabel) {
            return;
        }

        try {
            fs.unlinkSync(filePath);
            this.update(this.currentUri);
        } catch (error) {
            vscode.window.showErrorMessage(vscode.l10n.t("Failed to delete file: {0}", String(error)));
        }

    }

    private update(uri: vscode.Uri): void {

        if (!this.panel) {
            return;
        }

        this.currentUri = uri;

        const isDirectory = fs.statSync(uri.fsPath).isDirectory();
        const characterFolder = isDirectory ? uri.fsPath : null;
        const projectRoot = this.projectRoot(uri);
        const characterName = this.characterName(uri);

        const dat = this.readDat(projectRoot, characterName);

        const stats = characterFolder
            ? new InitAnalyzer(projectRoot).getStats(characterFolder)
            : {};

        const portraitDir = path.join(projectRoot, "gfx", "portrait");

        const portrait = this.findImage(portraitDir, characterName);

        const portraitVariants = this.findAllImages(portraitDir, characterName);

        const mugDir = path.join(projectRoot, "gfx", "mugs");

        const mug = this.findImage(mugDir, characterName);

        const mugVariants = this.findAllImages(mugDir, characterName);

        const sticker = this.findImage(
            path.join(projectRoot, "sticker", "common"),
            characterName
        );

        const bustDir = path.join(projectRoot, "gfx", "bust");

        const bust = this.findImage(bustDir, characterName);

        const bustVariants = this.findAllImages(bustDir, characterName);

        const guide = this.findGuide(projectRoot, characterName);

        const palettes = this.findPalettes(projectRoot, characterName);

        const seriesIcon = dat
            ? this.findImage(path.join(projectRoot, "gfx", "seriesicon"), dat.seriesName)
            : undefined;

        const folderMusic = this.findAudioFiles(
            path.join(projectRoot, "music", characterName)
        );

        const versusMusic = this.findVersusMusic(projectRoot, characterName);

        const victoryTrack = this.findVictoryMusic(projectRoot, characterName, dat?.seriesName);

        const victoryLoopTrack = this.findVictoryLoopMusic(projectRoot, characterName, dat?.seriesName);

        this.panel.title = vscode.l10n.t("Data - {0}", characterName);

        this.panel.webview.html = this.html(
            characterName,
            dat,
            stats,
            guide,
            {
                portrait: portrait ? this.panel.webview.asWebviewUri(vscode.Uri.file(portrait)) : undefined,
                mug: mug ? this.panel.webview.asWebviewUri(vscode.Uri.file(mug)) : undefined,
                sticker: sticker ? this.panel.webview.asWebviewUri(vscode.Uri.file(sticker)) : undefined,
                bust: bust ? this.panel.webview.asWebviewUri(vscode.Uri.file(bust)) : undefined
            },
            seriesIcon ? this.panel.webview.asWebviewUri(vscode.Uri.file(seriesIcon)) : undefined,
            palettes.map((p, i) => ({
                uri: this.panel!.webview.asWebviewUri(vscode.Uri.file(p)),
                name: this.paletteLabel(dat, i)
            })),
            portraitVariants.map((p, i) => ({
                uri: this.panel!.webview.asWebviewUri(vscode.Uri.file(p)),
                name: this.paletteLabel(dat, i)
            })),
            mugVariants.map((p, i) => ({
                uri: this.panel!.webview.asWebviewUri(vscode.Uri.file(p)),
                name: this.paletteLabel(dat, i)
            })),
            bustVariants.map((p, i) => ({
                uri: this.panel!.webview.asWebviewUri(vscode.Uri.file(p)),
                name: this.paletteLabel(dat, i)
            })),
            this.toMusicEntries(folderMusic),
            this.toMusicEntries(versusMusic),
            this.toVictoryEntry(victoryTrack),
            this.toVictoryEntry(victoryLoopTrack)
        );

    }

    private toVictoryEntry(
        track: { file: string; label: string } | undefined
    ): { uri: vscode.Uri; label: string; path: string } | undefined {

        return track
            ? {
                uri: this.panel!.webview.asWebviewUri(vscode.Uri.file(track.file)),
                label: track.label,
                path: track.file
            }
            : undefined;

    }

    private toMusicEntries(files: string[]): { uri: vscode.Uri; name: string; path: string }[] {

        return files.map(f => ({
            uri: this.panel!.webview.asWebviewUri(vscode.Uri.file(f)),
            name: path.basename(f, path.extname(f)),
            path: f
        }));

    }

    /**
     * Libellé d'une palette d'après son index dans le .dat.
     * mode === -1 signifie que la palette n'est pas recolorée
     * et utilise donc la palette par défaut du personnage.
     */
    private paletteLabel(dat: CharacterDat | null, index: number): string | undefined {

        const palette = dat?.palettes[index];

        if (!palette)
            return undefined;

        return palette.mode === -1
            ? vscode.l10n.t("{0} (default)", palette.name)
            : palette.name;

    }

    /**
     * fighter/<nom>/ (dossier source) et fighter/<nom>.bin (compilé)
     * sont tous deux situés directement dans fighter/, donc la racine
     * du projet est dans les deux cas le parent de fighter/.
     */
    private projectRoot(uri: vscode.Uri): string {

        return path.dirname(path.dirname(uri.fsPath));

    }

    private readDat(projectRoot: string, characterName: string): CharacterDat | null {

        const datPath = path.join(projectRoot, "data", "dats", `${characterName}.dat`);

        if (!fs.existsSync(datPath))
            return null;

        return DatParcer.read(datPath);

    }

    /**
     * Cherche une image dont le nom commence par celui du personnage
     * dans le dossier donné (correspondance exacte privilégiée).
     */
    private findImage(dir: string, characterName: string): string | undefined {

        if (!fs.existsSync(dir))
            return undefined;

        const exact = path.join(dir, `${characterName}.png`);

        if (fs.existsSync(exact))
            return exact;

        const lower = characterName.toLowerCase();

        const match = fs.readdirSync(dir)
            .filter(f => IMAGE_EXTENSIONS.test(f))
            .find(f => f.toLowerCase().startsWith(lower));

        return match
            ? path.join(dir, match)
            : undefined;

    }

    /**
     * Liste toutes les images d'un personnage dans un dossier donné
     * (ex: <nom>.png, <nom>_1.png, <nom>_2.png...), triées par index.
     */
    private findAllImages(dir: string, characterName: string): string[] {

        if (!fs.existsSync(dir))
            return [];

        const lower = characterName.toLowerCase();

        return fs.readdirSync(dir)
            .filter(f => IMAGE_EXTENSIONS.test(f))
            .filter(f => {

                const base = f.toLowerCase().replace(IMAGE_EXTENSIONS, "");

                return base === lower || base.startsWith(`${lower}_`);

            })
            .sort((a, b) => {

                const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
                const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;

                return numA - numB;

            })
            .map(f => path.join(dir, f));

    }

    /**
     * Cherche le guide texte du personnage dans character_guides/<nom>.txt
     * (correspondance exacte privilégiée, sinon préfixe insensible à la casse).
     */
    private findGuide(projectRoot: string, characterName: string): string | undefined {

        const dir = path.join(projectRoot, "character_guides");

        if (!fs.existsSync(dir))
            return undefined;

        const exact = path.join(dir, `${characterName}.txt`);

        if (fs.existsSync(exact))
            return fs.readFileSync(exact, "utf8");

        const lower = characterName.toLowerCase();

        const match = fs.readdirSync(dir)
            .filter(f => /\.txt$/i.test(f))
            .find(f => f.toLowerCase().startsWith(lower));

        return match
            ? fs.readFileSync(path.join(dir, match), "utf8")
            : undefined;

    }

    /**
     * Liste les palettes de couleurs d'un personnage dans
     * palettes/<nom>/*.png, triées par index numérique.
     */
    private findPalettes(projectRoot: string, characterName: string): string[] {

        const dir = path.join(projectRoot, "palettes", characterName);

        if (!fs.existsSync(dir))
            return [];

        return fs.readdirSync(dir)
            .filter(f => IMAGE_EXTENSIONS.test(f))
            .sort((a, b) => {

                const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
                const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;

                return numA - numB;

            })
            .map(f => path.join(dir, f));

    }

    /**
     * Liste les fichiers audio d'un dossier donné.
     */
    private findAudioFiles(dir: string): string[] {

        if (!fs.existsSync(dir))
            return [];

        return fs.readdirSync(dir)
            .filter(f => AUDIO_EXTENSIONS.test(f))
            .sort((a, b) => a.localeCompare(b))
            .map(f => path.join(dir, f));

    }

    /**
     * Cherche les musiques de victoire/versus d'un personnage dans
     * music/versus, par préfixe ou occurrence du nom dans le fichier
     * (même logique que MusicAnalyzer.getCharacterVersusMusic).
     */
    private findVersusMusic(projectRoot: string, characterName: string): string[] {

        const dir = path.join(projectRoot, "music", "versus");

        if (!fs.existsSync(dir))
            return [];

        const lower = characterName.toLowerCase();

        return fs.readdirSync(dir)
            .filter(f => AUDIO_EXTENSIONS.test(f))
            .filter(f => {

                const name = f.toLowerCase();

                return (
                    name.startsWith(lower + "_") ||
                    name.includes("_" + lower + "_") ||
                    name.includes("_" + lower + ".") ||
                    name.includes(lower + ".")
                );

            })
            .sort((a, b) => a.localeCompare(b))
            .map(f => path.join(dir, f));

    }

    /**
     * Cherche le thème de victoire d'un personnage : un thème individuel
     * dans music/victory/individual/<nom> est prioritaire, sinon le thème
     * de la franchise (music/victory/<code franchise>) est utilisé.
     */
    private findVictoryMusic(
        projectRoot: string,
        characterName: string,
        seriesCode: string | undefined
    ): { file: string; label: string } | undefined {

        const individualDir = path.join(projectRoot, "music", "victory", "individual");

        const individual = this.findExactAudio(individualDir, characterName);

        if (individual)
            return { file: individual, label: vscode.l10n.t("Individual") };

        if (!seriesCode)
            return undefined;

        const victoryDir = path.join(projectRoot, "music", "victory");

        const series = this.findExactAudio(victoryDir, seriesCode);

        return series
            ? { file: series, label: vscode.l10n.t("Franchise ({0})", seriesCode) }
            : undefined;

    }

    /**
     * Cherche un fichier audio dont le nom (hors extension) correspond
     * exactement (insensible à la casse) au nom donné.
     */
    private findExactAudio(dir: string, name: string): string | undefined {

        if (!fs.existsSync(dir))
            return undefined;

        const lower = name.toLowerCase();

        const match = fs.readdirSync(dir)
            .filter(f => AUDIO_EXTENSIONS.test(f))
            .find(f => f.toLowerCase().replace(AUDIO_EXTENSIONS, "") === lower);

        return match
            ? path.join(dir, match)
            : undefined;

    }

    /**
     * Cherche la version en boucle du thème de victoire : un thème
     * individuel dans music/victory/individual_loop/<nom>_... est
     * prioritaire, sinon celui de la franchise dans
     * music/victory/series_loop/<code franchise>_... est utilisé.
     * (les fichiers de boucle ont un suffixe, ex: <nom>_victory__....ogg)
     */
    private findVictoryLoopMusic(
        projectRoot: string,
        characterName: string,
        seriesCode: string | undefined
    ): { file: string; label: string } | undefined {

        const individualLoopDir = path.join(projectRoot, "music", "victory", "individual_loop");

        const individual = this.findPrefixedAudio(individualLoopDir, characterName);

        if (individual)
            return { file: individual, label: vscode.l10n.t("Individual (loop)") };

        if (!seriesCode)
            return undefined;

        const seriesLoopDir = path.join(projectRoot, "music", "victory", "series_loop");

        const series = this.findPrefixedAudio(seriesLoopDir, seriesCode);

        return series
            ? { file: series, label: vscode.l10n.t("Franchise ({0}, loop)", seriesCode) }
            : undefined;

    }

    /**
     * Cherche un fichier audio dont le nom commence par "<préfixe>_"
     * (insensible à la casse).
     */
    private findPrefixedAudio(dir: string, prefix: string): string | undefined {

        if (!fs.existsSync(dir))
            return undefined;

        const lower = prefix.toLowerCase();

        const match = fs.readdirSync(dir)
            .filter(f => AUDIO_EXTENSIONS.test(f))
            .find(f => f.toLowerCase().startsWith(`${lower}_`));

        return match
            ? path.join(dir, match)
            : undefined;

    }

    private html(
        characterName: string,
        dat: CharacterDat | null,
        stats: Record<string, string>,
        guide: string | undefined,
        images: {
            portrait?: vscode.Uri;
            mug?: vscode.Uri;
            sticker?: vscode.Uri;
            bust?: vscode.Uri;
        },
        seriesIcon: vscode.Uri | undefined,
        palettes: { uri: vscode.Uri; name?: string }[],
        portraitVariants: { uri: vscode.Uri; name?: string }[],
        mugVariants: { uri: vscode.Uri; name?: string }[],
        bustVariants: { uri: vscode.Uri; name?: string }[],
        folderMusic: { uri: vscode.Uri; name: string; path: string }[],
        versusMusic: { uri: vscode.Uri; name: string; path: string }[],
        victoryTrack: { uri: vscode.Uri; label: string; path: string } | undefined,
        victoryLoopTrack: { uri: vscode.Uri; label: string; path: string } | undefined
    ): string {

        const datRows = dat
            ? [
                [vscode.l10n.t("CSS Name"), dat.cssName],
                [vscode.l10n.t("Menu Name"), dat.menuName],
                [vscode.l10n.t("Battle Name"), dat.battleName],
                [vscode.l10n.t("Series Name"), dat.seriesName],
                [vscode.l10n.t("Home Stages"), dat.homeStages.join(", ") || "—"]
            ]
            : [];

        const statRows = Object.entries(stats);

        return `<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<style>

body{

    font-family: var(--vscode-font-family, sans-serif);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    padding: 16px 24px;

}

h1{

    font-size: 1.4em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;

}

.series-icon{

    width: 28px;
    height: 28px;
    object-fit: contain;
    image-rendering: pixelated;

}

h2{

    font-size: 1.1em;
    margin-top: 24px;
    border-bottom: 1px solid var(--vscode-panel-border, #444);
    padding-bottom: 4px;

}

table{

    border-collapse: collapse;
    width: 100%;
    max-width: 480px;

}

td{

    padding: 4px 12px 4px 0;
    vertical-align: top;

}

td.key{

    color: var(--vscode-descriptionForeground, #999);
    white-space: nowrap;

}

.empty{

    color: var(--vscode-descriptionForeground, #999);
    font-style: italic;

}

.gallery{

    display: flex;
    flex-wrap: wrap;
    gap: 16px;

}

.gallery figure{

    margin: 0;
    text-align: center;

}

.gallery img{

    max-width: 160px;
    max-height: 160px;
    image-rendering: pixelated;
    background: #1e1e1e;
    border: 1px solid var(--vscode-panel-border, #444);

}

.gallery figcaption{

    margin-top: 4px;
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground, #999);

}

.guide{

    white-space: pre-wrap;
    line-height: 1.5;
    max-width: 720px;

}

.palettes{

    display: flex;
    flex-wrap: wrap;
    gap: 8px;

}

.palettes figure{

    margin: 0;
    text-align: center;

}

.palettes img{

    width: 64px;
    height: 64px;
    object-fit: contain;
    image-rendering: pixelated;
    background: #1e1e1e;
    border: 1px solid var(--vscode-panel-border, #444);

}

.palettes figcaption{

    margin-top: 2px;
    font-size: 0.75em;
    color: var(--vscode-descriptionForeground, #999);
    max-width: 64px;

}

.music-list{

    list-style: none;
    padding: 0;
    margin: 0;
    max-width: 640px;

}

.music-list li{

    margin-bottom: 10px;

}

.music-list .track-name{

    font-size: 0.85em;
    margin-bottom: 2px;

}

.music-list audio{

    width: 100%;
    height: 32px;

}

.music-list .track-row{

    display: flex;
    align-items: center;
    gap: 8px;

}

.music-list .track-row audio{

    flex: 1;

}

.delete-btn{

    flex-shrink: 0;
    background: transparent;
    border: 1px solid var(--vscode-panel-border, #444);
    color: var(--vscode-errorForeground, #f48771);
    border-radius: 4px;
    cursor: pointer;
    padding: 2px 8px;
    font-size: 0.85em;

}

.delete-btn:hover{

    background: var(--vscode-inputValidation-errorBackground, #5a1d1d);

}

</style>

</head>

<body>

<h1>${seriesIcon ? `<img class="series-icon" src="${seriesIcon}">` : ""}${this.escape(characterName)}</h1>

<h2>🖼 ${this.escape(vscode.l10n.t("Visuals"))}</h2>

${this.galleryHtml(images)}

<h2>🎭 ${this.escape(vscode.l10n.t("Alternate portraits"))}</h2>

${portraitVariants.length
        ? `<div class="palettes">${portraitVariants.map(p => `<figure><img src="${p.uri}"><figcaption>${this.escape(p.name ?? "")}</figcaption></figure>`).join("")}</div>`
        : `<p class="empty">${this.escape(vscode.l10n.t("No alternate portrait found in gfx/portrait."))}</p>`}

<h2>🗣 ${this.escape(vscode.l10n.t("Alternate mugs"))}</h2>

${mugVariants.length
        ? `<div class="palettes">${mugVariants.map(p => `<figure><img src="${p.uri}"><figcaption>${this.escape(p.name ?? "")}</figcaption></figure>`).join("")}</div>`
        : `<p class="empty">${this.escape(vscode.l10n.t("No alternate mug found in gfx/mugs."))}</p>`}

<h2>👤 ${this.escape(vscode.l10n.t("Alternate busts"))}</h2>

${bustVariants.length
        ? `<div class="palettes">${bustVariants.map(p => `<figure><img src="${p.uri}"><figcaption>${this.escape(p.name ?? "")}</figcaption></figure>`).join("")}</div>`
        : `<p class="empty">${this.escape(vscode.l10n.t("No alternate bust found in gfx/bust."))}</p>`}

<h2>📄 .dat</h2>

${datRows.length
        ? `<table>${datRows.map(([k, v]) => `<tr><td class="key">${this.escape(k)}</td><td>${this.escape(v)}</td></tr>`).join("")}</table>`
        : `<p class="empty">${this.escape(vscode.l10n.t("No .dat file found for this character."))}</p>`}

<h2>📊 ${this.escape(vscode.l10n.t("Stats (init.txt)"))}</h2>

${statRows.length
        ? `<table>${statRows.map(([k, v]) => `<tr><td class="key">${this.escape(k)}</td><td>${this.escape(v)}</td></tr>`).join("")}</table>`
        : `<p class="empty">${this.escape(vscode.l10n.t("No stats found in init.txt (character compiled to .bin only)."))}</p>`}

<h2>📖 ${this.escape(vscode.l10n.t("Guide"))}</h2>

${guide
        ? `<div class="guide">${this.escape(guide)}</div>`
        : `<p class="empty">${this.escape(vscode.l10n.t("No guide found in character_guides."))}</p>`}

<h2>🎨 ${this.escape(vscode.l10n.t("Palettes"))}</h2>

${palettes.length
        ? `<div class="palettes">${palettes.map(p => `<figure><img src="${p.uri}"><figcaption>${this.escape(p.name ?? "")}</figcaption></figure>`).join("")}</div>`
        : `<p class="empty">${this.escape(vscode.l10n.t("No palette found in palettes/{0}.", characterName))}</p>`}

<h2>🎵 ${this.escape(vscode.l10n.t("Character music"))}</h2>

${this.musicListHtml(folderMusic, vscode.l10n.t("No music found in music/{0}.", characterName))}

<h2>⚔️ ${this.escape(vscode.l10n.t("Battle music (Versus)"))}</h2>

${this.musicListHtml(versusMusic, vscode.l10n.t("No battle music found in music/versus."))}

<h2>🏆 ${this.escape(vscode.l10n.t("Victory theme"))}</h2>

${this.victoryListHtml(
        [victoryTrack, victoryLoopTrack],
        vscode.l10n.t("No victory theme found in music/victory.")
    )}

<script>
const vscode = acquireVsCodeApi();
function deleteTrack(encodedPath) {
    vscode.postMessage({ type: "deleteMusic", path: decodeURIComponent(encodedPath) });
}
</script>

</body>

</html>`;

    }

    private galleryHtml(images: {
        portrait?: vscode.Uri;
        mug?: vscode.Uri;
        sticker?: vscode.Uri;
        bust?: vscode.Uri;
    }): string {

        const entries: [string, vscode.Uri | undefined][] = [
            [vscode.l10n.t("Portrait"), images.portrait],
            [vscode.l10n.t("Bust"), images.bust],
            [vscode.l10n.t("Mug"), images.mug],
            [vscode.l10n.t("Sticker"), images.sticker]
        ];

        const figures = entries
            .filter((entry): entry is [string, vscode.Uri] => entry[1] !== undefined)
            .map(([label, uri]) => `<figure><img src="${uri}"><figcaption>${this.escape(label)}</figcaption></figure>`)
            .join("");

        return figures
            ? `<div class="gallery">${figures}</div>`
            : `<p class="empty">${this.escape(vscode.l10n.t("No visuals found for this character."))}</p>`;

    }

    private victoryListHtml(
        tracks: ({ uri: vscode.Uri; label: string; path: string } | undefined)[],
        emptyMessage: string
    ): string {

        return this.musicListHtml(
            tracks
                .filter((t): t is { uri: vscode.Uri; label: string; path: string } => t !== undefined)
                .map(t => ({ uri: t.uri, name: t.label, path: t.path })),
            emptyMessage
        );

    }

    private musicListHtml(
        tracks: { uri: vscode.Uri; name: string; path: string }[],
        emptyMessage: string
    ): string {

        if (!tracks.length)
            return `<p class="empty">${this.escape(emptyMessage)}</p>`;

        const deleteLabel = this.escape(vscode.l10n.t("Delete"));

        const items = tracks
            .map(t => `<li><div class="track-name">${this.escape(t.name)}</div><div class="track-row"><audio controls src="${t.uri}"></audio><button class="delete-btn" onclick="deleteTrack('${encodeURIComponent(t.path)}')">${deleteLabel}</button></div></li>`)
            .join("");

        return `<ul class="music-list">${items}</ul>`;

    }

    private characterName(uri: vscode.Uri): string {

        return path.basename(uri.fsPath, path.extname(uri.fsPath));

    }

    private escape(value: string): string {

        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    public dispose(): void {

        this.panel?.dispose();

    }

}
