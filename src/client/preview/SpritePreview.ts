import * as vscode from "vscode";

export class SpritePreview implements vscode.Disposable {

    private panel?: vscode.WebviewPanel;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public register(): void {

        this.context.subscriptions.push(

            vscode.commands.registerCommand(

                "crusade-tools.previewSprite",

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

            "crusadeSpritePreview",

            `Sprite - ${this.fileName(uri)}`,

            vscode.ViewColumn.Beside,

            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(this.context.extensionPath),
                    vscode.Uri.file(uri.fsPath)
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

        const image =
            this.panel.webview.asWebviewUri(uri);

        this.panel.title =
            `Sprite - ${this.fileName(uri)}`;

        this.panel.webview.html =
            this.getHtml(image);

    }

    private getHtml(image: vscode.Uri): string {

        return `<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<style>

html,
body{

    width:100%;
    height:100%;

    margin:0;

    background:#1e1e1e;

    display:flex;

    justify-content:center;

    align-items:center;

    overflow:hidden;

}

img{

    image-rendering:pixelated;

    max-width:100%;

    max-height:100%;

    object-fit:contain;

}

</style>

</head>

<body>

<img src="${image}" />

</body>

</html>`;

    }

    private fileName(uri: vscode.Uri): string {

        return uri.path.split("/").pop() ?? "";

    }

    public dispose(): void {

        this.panel?.dispose();

    }

}