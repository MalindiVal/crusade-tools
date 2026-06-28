import * as vscode from "vscode";

export class FileWatcherService implements vscode.Disposable {

    private readonly watchers: vscode.FileSystemWatcher[] = [];

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public watch(
        glob: string,
        callback: (uri: vscode.Uri) => void
    ): vscode.FileSystemWatcher {

        const watcher =
            vscode.workspace.createFileSystemWatcher(glob);

        watcher.onDidCreate(callback);
        watcher.onDidChange(callback);
        watcher.onDidDelete(callback);

        this.watchers.push(watcher);
        this.context.subscriptions.push(watcher);

        return watcher;

    }

    public watchFile(
        relativePath: string,
        callback: (uri: vscode.Uri) => void
    ): void {

        this.watch(`**/${relativePath}`, callback);

    }

    public watchFolder(
        folder: string,
        extension: string,
        callback: (uri: vscode.Uri) => void
    ): void {

        this.watch(
            `**/${folder}/**/*.${extension}`,
            callback
        );

    }

    public dispose(): void {

        for (const watcher of this.watchers) {
            watcher.dispose();
        }

        this.watchers.length = 0;

    }

}