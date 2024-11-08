import * as vscode from 'vscode';

import SketchCustomProvider from './SketchCustomProvider';

export function activate(context: vscode.ExtensionContext): void {
  const extensionRoot = vscode.Uri.file(context.extensionPath);
  // Register our custom editor provider
  const provider = new SketchCustomProvider(extensionRoot);
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(SketchCustomProvider.viewType, provider, {
      webviewOptions: {
        enableFindWidget: false, // default
        retainContextWhenHidden: true
      }
    })
  );
}
// This method is called when your extension is deactivated
export function deactivate() {}
