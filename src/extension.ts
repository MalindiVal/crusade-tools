import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { CrusadeTreeProvider } from './tree/crusadeTreeProvider';

interface CrusadeLogEntry {
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp?: string;
    lineNumber: number;
}

const CHARACTER_TEMPLATE_FILES = [
    'init.txt', 'jab.txt', 'dab.txt', 'fair.txt', 'bair.txt', 'uair.txt', 'dair.txt', 'nair.txt',
    'sab.txt', 'sideb.txt', 'upb.txt', 'downb.txt', 'final_smash.txt',
    'dash_attack.txt', 'utilt.txt', 'dtilt.txt', 'stilt.txt',
    'usmash.txt', 'dsmash.txt', 'ssmash.txt',
    'grab.txt', 'hold.txt', 'uthrow.txt', 'dthrow.txt', 'bthrow.txt', 'fthrow.txt',
    'entry.txt', 'taunt.txt', 'win.txt', 'lose.txt', 'result.txt', 'tag.txt',
    'step.txt', 'edge_attack.txt', 'glide_attack.txt', 'ai.txt'
];

function isCrusadeProject(root: string): boolean {
    const required = [
        "data",
		"fighter",
        "stage",
        "item",
        "music",
        "palettes",
        "INDEX"
    ];

    return required.every(file =>
        fs.existsSync(path.join(root, file))
    );
}

export function activate(context: vscode.ExtensionContext) {
    console.log('🎮 Crusade Tools activated!');
	console.log("STEP 1");
vscode.window.showInformationMessage("STEP 1");

	const workspace = vscode.workspace.workspaceFolders?.[0];

	if(workspace){

		const provider = new CrusadeTreeProvider(
			workspace.uri.fsPath
		);

		context.subscriptions.push(
			vscode.window.registerTreeDataProvider(
				"crusadeExplorer",
				provider
			)
		);

	}

	if (workspace && isCrusadeProject(workspace.uri.fsPath)) {
		vscode.window.setStatusBarMessage(
			"🎮 Smash Crusade Project",
			5000
		);
	}
    
    let isWatching = true;
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('crusadeTools');

    // Watch Crusade-specific logs
    const errorLogWatcher = vscode.workspace.createFileSystemWatcher('**/error.log');
    const spriteCountWatcher = vscode.workspace.createFileSystemWatcher('**/spritecount.log');

    const analyzeCrusadeLog = async (uri: vscode.Uri) => {
        if (!isWatching) return;

        try {
            const document = await vscode.workspace.openTextDocument(uri);
            const text = document.getText();
            const lines = text.split('\n');
            const diagnostics: vscode.Diagnostic[] = [];
            const entries: CrusadeLogEntry[] = [];

            // Parse Crusade log format
            lines.forEach((line, index) => {
                if (!line.trim()) return;

                let severity = vscode.DiagnosticSeverity.Information;
                let message = line;
                let type: 'error' | 'warning' | 'info' = 'info';

                // Detect errors
                if (line.toUpperCase().includes('ERROR') || line.toUpperCase().includes('FAILED')) {
                    severity = vscode.DiagnosticSeverity.Error;
                    type = 'error';
                    message = `⚠️ ${line}`;
                } 
                // Detect warnings
                else if (line.toUpperCase().includes('WARNING') || line.toUpperCase().includes('WARN')) {
                    severity = vscode.DiagnosticSeverity.Warning;
                    type = 'warning';
                    message = `⚡ ${line}`;
                }

                entries.push({
                    type,
                    message,
                    lineNumber: index + 1
                });

                const range = new vscode.Range(
                    new vscode.Position(index, 0),
                    new vscode.Position(index, line.length)
                );

                const diagnostic = new vscode.Diagnostic(range, message, severity);
                diagnostic.source = '🎮 Crusade';
                diagnostics.push(diagnostic);
            });

            diagnosticCollection.set(uri, diagnostics);

            // Notify based on log type
            const fileName = path.basename(uri.fsPath);
            const errorCount = entries.filter(e => e.type === 'error').length;
            const warnCount = entries.filter(e => e.type === 'warning').length;

            if (errorCount > 0) {
                vscode.window.showErrorMessage(
                    `🎮 ${fileName}: ${errorCount} error(s), ${warnCount} warning(s)`,
                    'View'
                ).then(selection => {
                    if (selection === 'View') {
                        vscode.window.showTextDocument(uri);
                    }
                });
            }
        } catch (error) {
            console.error('Error analyzing Crusade log:', error);
        }
    };

	if (workspace) {
		const errorLog = path.join(
			workspace.uri.fsPath,
			"error.log"
		);

		if (fs.existsSync(errorLog)) {
			analyzeCrusadeLog(vscode.Uri.file(errorLog));
		}
	}

    errorLogWatcher.onDidChange(analyzeCrusadeLog);
   
    errorLogWatcher.onDidCreate((uri) => {
        if (isWatching) {
            vscode.window.showInformationMessage(`🎮 Crusade error.log created`);
        }
    });

    // Create Character command
    context.subscriptions.push(
        vscode.commands.registerCommand('crusade-tools.createCharacter', async () => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const characterName = await vscode.window.showInputBox({
                prompt: '🎮 Character name (e.g., "vmi_yangyun")',
                placeHolder: 'character_name',
                validateInput: (value) => {
                    if (!value.trim()) return 'Name cannot be empty';
                    if (!/^[a-z0-9_]+$/.test(value)) return 'Use lowercase letters, numbers, underscores only';
                    return '';
                }
            });

            if (!characterName) return;

			const fighterFolder = path.join(
				workspaceFolder.uri.fsPath,
				"fighter"
			);

			if (!fs.existsSync(fighterFolder)) {
				vscode.window.showErrorMessage(
					"fighter folder not found."
				);
				return;
			}

			const fighters = fs.readdirSync(fighterFolder);

			if (fighters.includes(characterName)) {
				vscode.window.showErrorMessage(`Character "${characterName}" already exists!`);
				return;
			}

            

			const characterPath = path.join(
				fighterFolder,
				characterName
			);

            // Check if exists
            if (fs.existsSync(characterPath)) {
                vscode.window.showErrorMessage(`Character "${characterName}" already exists!`);
                return;
            }

            try {
                // Create character directory
                fs.mkdirSync(characterPath, { recursive: true });

                // Create all template files
                for (const file of CHARACTER_TEMPLATE_FILES) {
                    const filePath = path.join(characterPath, file);
                    const templateContent = `// ${file} for ${characterName}\n// Created: ${new Date().toISOString()}\n\n`;
                    fs.writeFileSync(filePath, templateContent);
                }

                // Create subdirectories for assets if needed
                fs.mkdirSync(path.join(characterPath, 'gfx'), { recursive: true });
                fs.mkdirSync(path.join(characterPath, 'sfx'), { recursive: true });

                vscode.window.showInformationMessage(
                    `🎮 Character "${characterName}" created with ${CHARACTER_TEMPLATE_FILES.length} action files!`,
                    'Open Folder'
                ).then(selection => {
                    if (selection === 'Open Folder') {
                        vscode.commands.executeCommand(
                            'vscode.openFolder',
                            vscode.Uri.file(characterPath),
                            false
                        );
                    }
                });

            } catch (error) {
                vscode.window.showErrorMessage(`Failed to create character: ${error}`);
            }
        })
    );

    // Toggle watch command
    context.subscriptions.push(
        vscode.commands.registerCommand('crusade-tools.toggleWatch', () => {
            isWatching = !isWatching;
            vscode.window.showInformationMessage(
                isWatching ? '▶️ Crusade watch enabled' : '⏸️ Crusade watch disabled'
            );
        })
    );

    // Clear logs command
    context.subscriptions.push(
        vscode.commands.registerCommand('crusade-tools.clearLogs', async () => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) return;

            const errorLogPath = path.join(workspaceFolder.uri.fsPath, 'error.log');
            const spriteLogPath = path.join(workspaceFolder.uri.fsPath, 'spritecount.log');

            try {
                if (fs.existsSync(errorLogPath)) fs.writeFileSync(errorLogPath, '');
                if (fs.existsSync(spriteLogPath)) fs.writeFileSync(spriteLogPath, '');
                diagnosticCollection.clear();
                vscode.window.showInformationMessage('🎮 Crusade logs cleared');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to clear logs: ${error}`);
            }
        })
    );

    // Open error.log command
    context.subscriptions.push(
        vscode.commands.registerCommand('crusade-tools.openErrorLog', async () => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const errorLogPath = path.join(workspaceFolder.uri.fsPath, 'error.log');
            if (!fs.existsSync(errorLogPath)) {
                vscode.window.showWarningMessage('error.log not found');
                return;
            }

            const uri = vscode.Uri.file(errorLogPath);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc);
        })
    );

	context.subscriptions.push(

		vscode.commands.registerCommand(

			"crusade-tools.openFighter",

			async (folderPath: string) => {

				const initFile = path.join(folderPath, "init.txt");

				if (!fs.existsSync(initFile)) {
					vscode.window.showWarningMessage(
						"init.txt not found."
					);
					return;
				}

				const doc = await vscode.workspace.openTextDocument(initFile);

				await vscode.window.showTextDocument(doc);

			}

		)

	);

    context.subscriptions.push(errorLogWatcher);
    context.subscriptions.push(spriteCountWatcher);
    context.subscriptions.push(diagnosticCollection);

    console.log('🎮 Crusade Tools ready');
}

export function deactivate() {
    console.log('🎮 Crusade Tools deactivated');
}