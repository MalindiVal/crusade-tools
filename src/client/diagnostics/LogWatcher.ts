import * as vscode from "vscode";

export class LogWatcher implements vscode.Disposable {

    private watcher?: vscode.FileSystemWatcher;

    public start(): void {

        this.watcher = vscode.workspace.createFileSystemWatcher(
            "**/{error.log,spritecount.log}"
        );

        this.watcher.onDidChange(uri => {
            console.log("Changed:", uri.fsPath);
        });

        this.watcher.onDidCreate(uri => {
            console.log("Created:", uri.fsPath);
        });

        this.watcher.onDidDelete(uri => {
            console.log("Deleted:", uri.fsPath);
        });

    }

    public dispose(): void {
        this.watcher?.dispose();
    }

}