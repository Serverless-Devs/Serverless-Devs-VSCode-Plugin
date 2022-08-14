import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import { ext } from "../extensionVariables";
import { TEMPLTE_FILE, TERMINAL_NAME } from "../constants";
import { getHtmlForWebview } from "./getHtmlForWebview";

export { getHtmlForWebview } from "./getHtmlForWebview";
export { MultiStepInput } from "./multiStepInput";
export { ItemData, TreeItem } from "./treeItem";

const ICON_PATH = 'https://docs.serverless-devs.com/favicon.ico';

export async function setPanelIcon(
  panel: vscode.WebviewPanel
) {
  panel.iconPath = vscode.Uri.parse(ICON_PATH);
}

export function getQuickCommands() {
  const filePath = path.join(ext.cwd, TEMPLTE_FILE);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return Array.isArray(data["quick-commands"]) ? data["quick-commands"] : [];
}

export function createTerminal(command: string): vscode.Terminal {
  const terminals = vscode.window.terminals;
  for (const item of terminals) {
    if (item.name === TERMINAL_NAME) {
      item.dispose();
    }
  }
  const terminal = vscode.window.createTerminal(TERMINAL_NAME);
  terminal.show();
  terminal.sendText(command);
  return terminal;
}

export function createTerminalWithExitStatus(command: string)
  : Promise<vscode.TerminalExitStatus> {
  const terminal = createTerminal(command);
  terminal.sendText("exit");
  return new Promise((resolve, reject) => {
    const disposeToken = vscode.window.onDidCloseTerminal(
      async (closedTerminal) => {
        if (closedTerminal === terminal) {
          disposeToken.dispose();
          if (terminal.exitStatus !== undefined) {
            resolve(terminal.exitStatus);
          } else {
            reject("Terminal exited with undefined status");
          }
        }
      }
    );
  });
}

export function updateWebview(
  panel: vscode.WebviewPanel,
  filename: string,
  context: vscode.ExtensionContext,
  parameter?: any
) {
  panel.webview.html = getHtmlForWebview(
    filename,
    context,
    panel.webview,
    parameter
  );
}
