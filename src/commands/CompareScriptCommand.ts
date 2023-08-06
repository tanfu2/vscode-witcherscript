import * as path from "path";
import * as vscode from "vscode";
import * as fse from "fs-extra";
import { Configuration } from "../components/Configuration";
import { Commands, Strings } from "../constants";

export class CompareScriptCommand implements Command {
    constructor(private configuration: Configuration, private uri: vscode.Uri) { }

    execute() {
        if (!vscode.workspace.workspaceFolders) {
            return;
        }

        let gamePath = this.configuration.GamePath;

        if (!gamePath) {
            vscode.window.showInformationMessage(Strings.GamePathIsRequired);

            vscode.commands.executeCommand(Commands.ShowSettingsPage);

            return;
        }

        let workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

        let relativeScriptPath = this.uri.fsPath.replace(workspacePath, "");
        let scriptPathParts = relativeScriptPath.split(path.sep);

        if (!scriptPathParts.includes("content")) {
            return;
        }

        while (scriptPathParts[0] !== "content") {
            scriptPathParts.shift();
        }

        scriptPathParts.shift();

        let originalScriptPath = path.join(gamePath, "content", "content0", ...scriptPathParts);

        if (!fse.pathExistsSync(originalScriptPath)) {
            return;
        }

        vscode.commands.executeCommand(
            "vscode.diff",
            vscode.Uri.file(originalScriptPath),
            vscode.Uri.file(this.uri.fsPath),
            `Diff ${path.basename(this.uri.fsPath)} (Original/Head)`,
            {}
        );
    }
}
