import * as vscode from "vscode";
import { CrusadeClient } from "./client/client";

let client: CrusadeClient;

export function activate(context: vscode.ExtensionContext): void {

    client = new CrusadeClient(context);

    client.start();

}

export function deactivate(): void {

    client?.dispose();

}