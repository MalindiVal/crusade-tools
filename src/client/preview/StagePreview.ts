import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export class StagePreview implements vscode.Disposable {

    private panel?: vscode.WebviewPanel;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public register(): void {

        this.context.subscriptions.push(

            vscode.commands.registerCommand(

                "crusade-tools.previewStage",

                (folder: vscode.Uri) => this.open(folder)

            )

        );

    }

    private open(folder: vscode.Uri): void {

        if (this.panel) {

            this.panel.reveal(vscode.ViewColumn.Beside);

            this.update(folder);

            return;

        }

        this.panel = vscode.window.createWebviewPanel(

            "crusadeStagePreview",

            `Stage - ${path.basename(folder.fsPath)}`,

            vscode.ViewColumn.Beside,

            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(folder.fsPath)
                ]
            }

        );

        this.panel.onDidDispose(() => {

            this.panel = undefined;

        });

        this.update(folder);

    }

    private update(folder: vscode.Uri): void {

        if (!this.panel) {
            return;
        }

        const images = this.findImages(folder.fsPath);

        this.panel.title =
            `Stage - ${path.basename(folder.fsPath)}`;

        this.panel.webview.html =
            this.getHtml(images);

    }

    private findImages(folder: string): vscode.Uri[] {

        const names = [

            "bg.png",
            "bg0.png",
            "bg1.png",
            "bg2.png",
            "bg3.png",
            "fg.png"

        ];

        return names
            .map(name => path.join(folder, name))
            .filter(fs.existsSync)
            .map(file =>
                this.panel!.webview.asWebviewUri(
                    vscode.Uri.file(file)
                )
            );

    }

    private getHtml(images: vscode.Uri[]): string {

        const layers = images
            .map(uri => `<img src="${uri}">`)
            .join("");

        return `
<!DOCTYPE html>

<html>

<head>

<style>

html,
body{

    margin:0;

    width:100%;
    height:100%;

    background:#202020;

    overflow:hidden;

}

#stage{

    position:relative;

    width:100%;

    height:100%;

}

img{

    position:absolute;

    left:50%;

    top:50%;

    transform:translate(-50%,-50%);

    image-rendering:pixelated;

    max-width:100%;

    max-height:100%;

}

</style>

</head>

<body>

<div id="stage">

${layers}

</div>

</body>

</html>
`;

    }

    public dispose(): void {

        this.panel?.dispose();

    }

}