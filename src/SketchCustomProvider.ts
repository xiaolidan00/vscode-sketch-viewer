import * as vscode from 'vscode';

import SketchPreview from './SketchPreview';

class SketchCustomProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'sketch.preview';
  private readonly _previews = new Set<SketchPreview>();
  private _activePreview: SketchPreview | undefined;

  constructor(private readonly extensionRoot: vscode.Uri) {}

  public openCustomDocument(uri: vscode.Uri): vscode.CustomDocument {
    return { uri, dispose: (): void => {} };
  }

  public async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewEditor: vscode.WebviewPanel
  ): Promise<void> {
    const preview = new SketchPreview(this.extensionRoot, document.uri, webviewEditor);
    this._previews.add(preview);
    this.setActivePreview(preview);

    webviewEditor.onDidDispose(() => {
      preview.dispose();
      this._previews.delete(preview);
    });

    webviewEditor.onDidChangeViewState(() => {
      if (webviewEditor.active) {
        this.setActivePreview(preview);
      } else if (this._activePreview === preview && !webviewEditor.active) {
        this.setActivePreview(undefined);
      }
    });
  }

  public get activePreview(): SketchPreview {
    return this._activePreview!;
  }

  private setActivePreview(value: SketchPreview | undefined): void {
    this._activePreview = value;
  }
}

export default SketchCustomProvider;
