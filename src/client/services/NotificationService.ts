import * as vscode from "vscode";

export class NotificationService {

    public info(
        message: string,
        ...actions: string[]
    ): Thenable<string | undefined> {

        return vscode.window.showInformationMessage(
            message,
            ...actions
        );

    }

    public success(
        message: string,
        ...actions: string[]
    ): Thenable<string | undefined> {

        return vscode.window.showInformationMessage(
            `$(check) ${message}`,
            ...actions
        );

    }

    public warning(
        message: string,
        ...actions: string[]
    ): Thenable<string | undefined> {

        return vscode.window.showWarningMessage(
            message,
            ...actions
        );

    }

    public error(
        message: string,
        ...actions: string[]
    ): Thenable<string | undefined> {

        return vscode.window.showErrorMessage(
            message,
            ...actions
        );

    }

    public async confirm(
        message: string,
        confirm = "Yes",
        cancel = "Cancel"
    ): Promise<boolean> {

        const result =
            await vscode.window.showWarningMessage(
                message,
                { modal: true },
                confirm,
                cancel
            );

        return result === confirm;

    }

    public async pick(
        title: string,
        items: string[]
    ): Promise<string | undefined> {

        return vscode.window.showQuickPick(
            items,
            {
                title
            }
        );

    }

    public async input(
        prompt: string,
        placeHolder?: string
    ): Promise<string | undefined> {

        return vscode.window.showInputBox({
            prompt,
            placeHolder
        });

    }

    public progress<T>(
        title: string,
        task: (
            progress: vscode.Progress<{
                message?: string;
                increment?: number;
            }>
        ) => Thenable<T> | Promise<T>
    ): Thenable<T> {

        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title,
                cancellable: false
            },
            task
        );

    }

    public status(
        message: string,
        timeout = 3000
    ): void {

        vscode.window.setStatusBarMessage(
            message,
            timeout
        );

    }

}