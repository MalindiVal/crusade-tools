import * as vscode from "vscode";

import { CommandRegistry } from "./commands";
import { LogWatcher } from "./diagnostics/LogWatcher";
import { LanguageClientManager } from "./language/LanguageClientManager";
import { CrusadeExplorer } from "./explorer/Explorer";
import { PreviewManager } from "./preview/PreviewManager";
import { NotificationService } from "./services/NotificationService";
import { WorkspaceService } from "./services/WorkspaceService";

export class CrusadeClient {

    private readonly explorer: CrusadeExplorer;
    private readonly commands: CommandRegistry;
    private readonly watcher: LogWatcher;
    private readonly language: LanguageClientManager;
    private readonly previews: PreviewManager;
    private workspace = new WorkspaceService();
    private notifications = new NotificationService();

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {

        this.explorer = new CrusadeExplorer(context, this.workspace,this.notifications);
        this.commands = new CommandRegistry(context);
        this.watcher = new LogWatcher();
        this.language = new LanguageClientManager(context);
        this.previews = new PreviewManager(context);

    }

    public async start(): Promise<void> {

        this.language.start();

        this.explorer.register();

        this.commands.register();

        this.watcher.start();

        this.previews.register();

    }

    public dispose(): void {

        this.language.stop();
        this.watcher.dispose?.();

    }

}