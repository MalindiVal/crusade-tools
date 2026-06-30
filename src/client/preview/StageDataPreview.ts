import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { StagesListParser } from "../parcer/StagesListParser";
import { StageInfo } from "../models/StageInfo";

const IMAGE_EXTENSIONS = /\.(png|bmp|gif|jpg|jpeg)$/i;
const AUDIO_EXTENSIONS = /\.(ogg|mp3|wav)$/i;

export class StageDataPreview implements vscode.Disposable {

    private panel?: vscode.WebviewPanel;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public register(): void {

        this.context.subscriptions.push(

            vscode.commands.registerCommand(

                "crusade-tools.previewStageData",

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

            "crusadeStageDataPreview",

            `Données - ${this.stageName(uri)}`,

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

        const projectRoot = this.projectRoot(uri);
        const stageName = this.stageName(uri);

        const info = StagesListParser.find(
            path.join(projectRoot, "data", "stages.txt"),
            stageName
        );

        const displayName = info?.displayName ?? stageName;

        const icon = this.findImage(
            path.join(projectRoot, "gfx", "stgicons"),
            stageName
        );

        const preview = this.findImage(
            path.join(projectRoot, "gfx", "stgprevs"),
            stageName
        );

        const seriesIcon = info
            ? this.findImage(path.join(projectRoot, "gfx", "seriesicon"), info.seriesCode)
            : undefined;

        const music = this.findAudioGroups(
            path.join(projectRoot, "music", "stage", stageName)
        ).map(group => ({
            label: group.label,
            tracks: group.files.map(f => ({
                uri: this.panel!.webview.asWebviewUri(vscode.Uri.file(f)),
                name: path.basename(f, path.extname(f))
            }))
        }));

        this.panel.title = `Données - ${displayName}`;

        this.panel.webview.html = this.html(displayName, stageName, info, {
            icon: icon ? this.panel.webview.asWebviewUri(vscode.Uri.file(icon)) : undefined,
            preview: preview ? this.panel.webview.asWebviewUri(vscode.Uri.file(preview)) : undefined,
            seriesIcon: seriesIcon ? this.panel.webview.asWebviewUri(vscode.Uri.file(seriesIcon)) : undefined
        }, music);

    }

    /**
     * stage/<nom>/ (dossier source) et stage/<nom>.bin (compilé)
     * sont tous deux situés directement dans stage/, donc la racine
     * du projet est dans les deux cas le parent de stage/.
     */
    private projectRoot(uri: vscode.Uri): string {

        return path.dirname(path.dirname(uri.fsPath));

    }

    /**
     * Cherche une image dont le nom commence par celui du stage
     * dans le dossier donné (correspondance exacte privilégiée).
     */
    private findImage(dir: string, stageName: string): string | undefined {

        if (!fs.existsSync(dir))
            return undefined;

        const exact = path.join(dir, `${stageName}.png`);

        if (fs.existsSync(exact))
            return exact;

        const lower = stageName.toLowerCase();

        const match = fs.readdirSync(dir)
            .filter(f => IMAGE_EXTENSIONS.test(f))
            .find(f => f.toLowerCase().startsWith(lower));

        return match
            ? path.join(dir, match)
            : undefined;

    }

    /**
     * Liste les fichiers audio d'un dossier de stage, groupés par
     * sous-dossier (ex: main/, alt/ pour les rotations de musique),
     * avec les fichiers en vrac à la racine sous "Default".
     */
    private findAudioGroups(dir: string): { label: string; files: string[] }[] {

        if (!fs.existsSync(dir))
            return [];

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        const groups: { label: string; files: string[] }[] = [];

        const looseFiles = entries
            .filter(e => e.isFile() && AUDIO_EXTENSIONS.test(e.name))
            .map(e => path.join(dir, e.name))
            .sort((a, b) => a.localeCompare(b));

        if (looseFiles.length > 0)
            groups.push({ label: "Default", files: looseFiles });

        const subDirs = entries
            .filter(e => e.isDirectory())
            .sort((a, b) => a.name.localeCompare(b.name));

        for (const sub of subDirs) {

            const subDir = path.join(dir, sub.name);

            const files = fs.readdirSync(subDir)
                .filter(f => AUDIO_EXTENSIONS.test(f))
                .sort((a, b) => a.localeCompare(b))
                .map(f => path.join(subDir, f));

            if (files.length > 0)
                groups.push({ label: sub.name, files });

        }

        return groups;

    }

    private html(
        displayName: string,
        stageId: string,
        info: StageInfo | undefined,
        images: {
            icon?: vscode.Uri;
            preview?: vscode.Uri;
            seriesIcon?: vscode.Uri;
        },
        music: { label: string; tracks: { uri: vscode.Uri; name: string }[] }[]
    ): string {

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

h1 img{

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

.series{

    margin: 0;
    color: var(--vscode-descriptionForeground, #999);

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

    max-width: 320px;
    max-height: 240px;
    image-rendering: pixelated;
    background: #1e1e1e;
    border: 1px solid var(--vscode-panel-border, #444);

}

.gallery figcaption{

    margin-top: 4px;
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground, #999);

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

.music-group-label{

    font-size: 0.9em;
    font-weight: 600;
    margin: 16px 0 8px;
    text-transform: capitalize;

}

</style>

</head>

<body>

<h1>${images.seriesIcon ? `<img src="${images.seriesIcon}">` : ""}${this.escape(displayName)}</h1>

${info?.seriesName ? `<p class="series">${this.escape(info.seriesName)}</p>` : ""}

<h2>🖼 Visuels</h2>

${this.galleryHtml(images)}

<h2>🎵 Musique du stage</h2>

${music.length
        ? music.map(group => `<div class="music-group-label">${this.escape(group.label)}</div>${this.musicListHtml(group.tracks, "")}`).join("")
        : `<p class="empty">Aucune musique trouvée dans music/stage/${this.escape(stageId)}.</p>`}

</body>

</html>`;

    }

    private galleryHtml(images: {
        icon?: vscode.Uri;
        preview?: vscode.Uri;
    }): string {

        const entries: [string, vscode.Uri | undefined][] = [
            ["Icon (CSS)", images.icon],
            ["Preview", images.preview]
        ];

        const figures = entries
            .filter((entry): entry is [string, vscode.Uri] => entry[1] !== undefined)
            .map(([label, uri]) => `<figure><img src="${uri}"><figcaption>${this.escape(label)}</figcaption></figure>`)
            .join("");

        return figures
            ? `<div class="gallery">${figures}</div>`
            : `<p class="empty">Aucun visuel trouvé pour ce stage.</p>`;

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

    private stageName(uri: vscode.Uri): string {

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
