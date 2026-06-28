import * as vscode from 'vscode';

export class CrusadeClient {
  constructor(private readonly context:vscode.ExtensionContext){}
  public start():void{
    // Start explorer, previews, diagnostics and language client
  }
}
