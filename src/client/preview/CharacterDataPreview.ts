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

        const projectRoot = this.projectRoot(uri);

        if (this.panel) {

            this.panel.reveal(vscode.ViewColumn.Beside);

            this.update(uri);

            return;

        }

        this.panel = vscode.window.createWebviewPanel(

            "crusadeCharacterDataPreview",

            `Données - ${this.characterName(uri)}`,

            vscode.ViewColumn.Beside,

            {
                enableScripts: false,
                localResourceRoots: [
                    vscode.Uri.file(projectRoot)
                ]
            }

        );

        this.panel.onDidDispose(() => {

            this.panel = undefined;

        });

        this.update(uri);

    }

    private update(uri: vscode.Uri): void {

        if (!this.panel) {
            return;
        }

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

        this.panel.title = `Données - ${characterName}`;

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
    ): { uri: vscode.Uri; label: string } | undefined {

        return track
            ? {
                uri: this.panel!.webview.asWebviewUri(vscode.Uri.file(track.file)),
                label: track.label
            }
            : undefined;

    }

    private toMusicEntries(files: string[]): { uri: vscode.Uri; name: string }[] {

        return files.map(f => ({
            uri: this.panel!.webview.asWebviewUri(vscode.Uri.file(f)),
            name: path.basename(f, path.extname(f))
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
            ? `${palette.name} (défaut)`
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
            return { file: individual, label: "Individuel" };

        if (!seriesCode)
            return undefined;

        const victoryDir = path.join(projectRoot, "music", "victory");

        const series = this.findExactAudio(victoryDir, seriesCode);

        return series
            ? { file: series, label: `Franchise (${seriesCode})` }
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
            return { file: individual, label: "Individuel (boucle)" };

        if (!seriesCode)
            return undefined;

        const seriesLoopDir = path.join(projectRoot, "music", "victory", "series_loop");

        const series = this.findPrefixedAudio(seriesLoopDir, seriesCode);

        return series
            ? { file: series, label: `Franchise (${seriesCode}, boucle)` }
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
        folderMusic: { uri: vscode.Uri; name: string }[],
        versusMusic: { uri: vscode.Uri; name: string }[],
        victoryTrack: { uri: vscode.Uri; label: string } | undefined,
        victoryLoopTrack: { uri: vscode.Uri; label: string } | undefined
    ): string {

        const datRows = dat
            ? [
                ["CSS Name", dat.cssName],
                ["Menu Name", dat.menuName],
                ["Battle Name", dat.battleName],
                ["Series Name", dat.seriesName],
                ["Home Stages", dat.homeStages.join(", ") || "—"]
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

</style>

</head>

<body>

<h1>${seriesIcon ? `<img class="series-icon" src="${seriesIcon}">` : ""}${this.escape(characterName)}</h1>

<h2>🖼 Visuels</h2>

${this.galleryHtml(images)}

<h2>🎭 Portraits alternatifs</h2>

${portraitVariants.length
        ? `<div class="palettes">${portraitVariants.map(p => `<figure><img src="${p.uri}"><figcaption>${this.escape(p.name ?? "")}</figcaption></figure>`).join("")}</div>`
        : `<p class="empty">Aucun portrait alternatif trouvé dans gfx/portrait.</p>`}

<h2>🗣 Mugs alternatifs</h2>

${mugVariants.length
        ? `<div class="palettes">${mugVariants.map(p => `<figure><img src="${p.uri}"><figcaption>${this.escape(p.name ?? "")}</figcaption></figure>`).join("")}</div>`
        : `<p class="empty">Aucun mug alternatif trouvé dans gfx/mugs.</p>`}

<h2>👤 Busts alternatifs</h2>

${bustVariants.length
        ? `<div class="palettes">${bustVariants.map(p => `<figure><img src="${p.uri}"><figcaption>${this.escape(p.name ?? "")}</figcaption></figure>`).join("")}</div>`
        : `<p class="empty">Aucun bust alternatif trouvé dans gfx/bust.</p>`}

<h2>📄 .dat</h2>

${datRows.length
        ? `<table>${datRows.map(([k, v]) => `<tr><td class="key">${this.escape(k)}</td><td>${this.escape(v)}</td></tr>`).join("")}</table>`
        : `<p class="empty">Aucun fichier .dat trouvé pour ce personnage.</p>`}

<h2>📊 Stats (init.txt)</h2>

${statRows.length
        ? `<table>${statRows.map(([k, v]) => `<tr><td class="key">${this.escape(k)}</td><td>${this.escape(v)}</td></tr>`).join("")}</table>`
        : `<p class="empty">Aucune stat trouvée dans init.txt (personnage compilé en .bin uniquement).</p>`}

<h2>📖 Guide</h2>

${guide
        ? `<div class="guide">${this.escape(guide)}</div>`
        : `<p class="empty">Aucun guide trouvé dans character_guides.</p>`}

<h2>🎨 Palettes</h2>

${palettes.length
        ? `<div class="palettes">${palettes.map(p => `<figure><img src="${p.uri}"><figcaption>${this.escape(p.name ?? "")}</figcaption></figure>`).join("")}</div>`
        : `<p class="empty">Aucune palette trouvée dans palettes/${this.escape(characterName)}.</p>`}

<h2>🎵 Musique du personnage</h2>

${this.musicListHtml(folderMusic, `Aucune musique trouvée dans music/${this.escape(characterName)}.`)}

<h2>⚔️ Musique de combat (Versus)</h2>

${this.musicListHtml(versusMusic, "Aucune musique de combat trouvée dans music/versus.")}

<h2>🏆 Thème de victoire</h2>

${this.victoryListHtml(
        [victoryTrack, victoryLoopTrack],
        "Aucun thème de victoire trouvé dans music/victory."
    )}

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
            ["Portrait", images.portrait],
            ["Bust", images.bust],
            ["Mug", images.mug],
            ["Sticker", images.sticker]
        ];

        const figures = entries
            .filter((entry): entry is [string, vscode.Uri] => entry[1] !== undefined)
            .map(([label, uri]) => `<figure><img src="${uri}"><figcaption>${this.escape(label)}</figcaption></figure>`)
            .join("");

        return figures
            ? `<div class="gallery">${figures}</div>`
            : `<p class="empty">Aucun visuel trouvé pour ce personnage.</p>`;

    }

    private victoryListHtml(
        tracks: ({ uri: vscode.Uri; label: string } | undefined)[],
        emptyMessage: string
    ): string {

        return this.musicListHtml(
            tracks
                .filter((t): t is { uri: vscode.Uri; label: string } => t !== undefined)
                .map(t => ({ uri: t.uri, name: t.label })),
            emptyMessage
        );

    }

    private musicListHtml(
        tracks: { uri: vscode.Uri; name: string }[],
        emptyMessage: string
    ): string {

        if (!tracks.length)
            return `<p class="empty">${this.escape(emptyMessage)}</p>`;

        const items = tracks
            .map(t => `<li><div class="track-name">${this.escape(t.name)}</div><audio controls src="${t.uri}"></audio></li>`)
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
