import * as path from "path";
import * as vscode from "vscode";

export class MusicPreview implements vscode.Disposable {

    private panel?: vscode.WebviewPanel;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public register(): void {

        this.context.subscriptions.push(

            vscode.commands.registerCommand(

                "crusade-tools.previewMusic",

                (uri: vscode.Uri) => this.open(uri)

            )

        );

    }

    private open(uri: vscode.Uri): void {

        if (this.panel) {

            this.panel.reveal(vscode.ViewColumn.Beside);

            this.update(uri);

            return;

        }

        this.panel = vscode.window.createWebviewPanel(

            "crusadeMusicPreview",

            path.basename(uri.fsPath),

            vscode.ViewColumn.Beside,

            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.dirname(uri.fsPath))
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

        const audio = this.panel.webview.asWebviewUri(uri);

        this.panel.title = path.basename(uri.fsPath);

        this.panel.webview.html = this.getHtml(
            audio,
            path.basename(uri.fsPath)
        );

    }

    private getHtml(
        audio: vscode.Uri,
        name: string
    ): string {

        return `<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

html,
body{

    margin:0;
    width:100%;
    height:100%;

    background:#1e1e1e;
    color:white;

    font-family:Segoe UI;

    display:flex;
    justify-content:center;
    align-items:center;

}

.container{

    width:90%;
    max-width:700px;

    text-align:center;

}

h2{

    margin-bottom:20px;

}

audio{

    width:100%;

}

.info{

    margin-top:15px;

    color:#999;

}

</style>

</head>

<body>

<div class="container">

<h2>🎵 ${name}</h2>

<audio controls autoplay>

    <source src="${audio}">

</audio>

<div class="info">

${name}

</div>

</div>

</body>

</html>`;

    }

    public dispose(): void {

        this.panel?.dispose();

    }

}