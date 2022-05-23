import * as vscode from "vscode";
import * as path from "path";
import { getUri } from "../lib/getUri";
import * as core from "@serverless-devs/core";
import { webViewEvent } from "./event/index";

const { fse } = core;

export function getHtmlForWebview(
  entryName: string,
  context: vscode.ExtensionContext,
  webview: vscode.Webview
) {
  webview.onDidReceiveMessage(webViewEvent, undefined, context.subscriptions);
  const indexHtml = path.join(
    context.extensionPath,
    "src",
    "webview",
    "ui",
    entryName,
    "index.html"
  );
  const toolkitUri = getUri(webview, context.extensionUri, [
    "node_modules",
    "@vscode",
    "webview-ui-toolkit",
    "dist",
    "toolkit.js", // A toolkit.min.js file is also available
  ]);

  const mainUri = getUri(webview, context.extensionUri, [
    "src",
    "webview",
    "ui",
    entryName,
    "main.js",
  ]);

  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <script type="module" src="${toolkitUri}"></script>
        <script type="module" src="${mainUri}"></script>
      </head>
      ${fse.readFileSync(indexHtml, "utf-8")}
    </html>
  `;
}
