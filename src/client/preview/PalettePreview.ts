import * as vscode from "vscode";

export class PalettePreview implements vscode.Disposable {

    private panel?: vscode.WebviewPanel;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public register(): void {

        this.context.subscriptions.push(

            vscode.commands.registerCommand(

                "crusade-tools.previewPalette",

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

            "crusadePalettePreview",

            `Palette - ${uri.path.split("/").pop()}`,

            vscode.ViewColumn.Beside,

            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(
                        this.context.extensionPath
                    ),
                    vscode.Uri.file(
                        uri.fsPath
                    )
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

        const image = this.panel.webview.asWebviewUri(uri);

        this.panel.title = `Palette - ${uri.path.split("/").pop()}`;

        this.panel.webview.html = this.html(image);

    }

    private html(image: vscode.Uri): string {

        return `<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<style>

html,
body{

    margin:0;
    background:#1e1e1e;

    display:flex;
    justify-content:center;
    align-items:center;

    width:100%;
    height:100%;

}

img{

    image-rendering:pixelated;

    max-width:95%;
    max-height:95%;

}

</style>

</head>

<body>

<img src="${image}">

</body>

</html>`;

    }

    public dispose(): void {

        this.panel?.dispose();

    }

}