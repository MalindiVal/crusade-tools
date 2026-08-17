import * as vscode from "vscode";

import { CrusadeTreeProvider } from "./CrusadeTreeProvider";
import { WorkspaceService } from "../services/WorkspaceService";
import { CrusadeNode } from "./CrusadeNode";
import { NotificationService } from "../services/NotificationService";

export class CrusadeExplorer {

    private readonly provider: CrusadeTreeProvider;
    private treeView!: vscode.TreeView<CrusadeNode>;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly workspace: WorkspaceService,
        private readonly notifications: NotificationService
    ) {

        this.provider = new CrusadeTreeProvider(
            this.workspace.getRoot()
        );

    }

    public register(): void {

        if (!this.workspace.isCrusadeProject()) {

            this.notifications.warning(
                vscode.l10n.t("The current workspace is not a Smash Crusade project.")
            );

            return;

        }

        this.treeView = vscode.window.createTreeView(
            "crusadeExplorer",
            {
                treeDataProvider: this.provider,
                showCollapseAll: true
            }
        );

        this.context.subscriptions.push(this.treeView);

        this.registerCommands();

    }

    public refresh(): void {
        this.provider.refresh();
    }

    public reveal(node: CrusadeNode): Thenable<void> {

        return this.treeView.reveal(node, {
            focus: true,
            select: true,
            expand: true
        });

    }

    private registerCommands(): void {

        this.context.subscriptions.push(

            vscode.commands.registerCommand(
                "crusade-tools.refreshExplorer",
                () => this.refresh()
            )

        );

    }

}