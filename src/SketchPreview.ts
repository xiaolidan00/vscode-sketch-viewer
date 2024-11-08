import * as path from 'path';
import * as vscode from 'vscode';

import { Disposable } from './disposable';
import JSZip from 'jszip';
import fs from 'fs';

type PreviewState = 'Disposed' | 'Visible' | 'Active';

export default class SketchPreview extends Disposable {
  private _previewState: PreviewState = 'Visible';

  constructor(
    private readonly extensionRoot: vscode.Uri,
    private readonly resource: vscode.Uri,
    private readonly webviewEditor: vscode.WebviewPanel
  ) {
    super();
    const resourceRoot = resource.with({
      path: resource.path.replace(/\/[^/]+?\.\w+$/, '/')
    });

    webviewEditor.webview.options = {
      enableScripts: true,
      localResourceRoots: [resourceRoot, extensionRoot]
    };

    this._register(
      webviewEditor.webview.onDidReceiveMessage((message) => {
        switch (message.type) {
          case 'reopen-as-text': {
            vscode.commands.executeCommand(
              'vscode.openWith',
              resource,
              'default',
              webviewEditor.viewColumn
            );
            break;
          }
        }
      })
    );

    this._register(
      webviewEditor.onDidChangeViewState(() => {
        this.update();
      })
    );

    this._register(
      webviewEditor.onDidDispose(() => {
        this._previewState = 'Disposed';
      })
    );

    const watcher = this._register(vscode.workspace.createFileSystemWatcher(resource.fsPath));
    this._register(
      watcher.onDidChange((e) => {
        if (e.toString() === this.resource.toString()) {
          this.reload();
        }
      })
    );
    this._register(
      watcher.onDidDelete((e) => {
        if (e.toString() === this.resource.toString()) {
          this.webviewEditor.dispose();
        }
      })
    );
    this.init();
  }
  async init() {
    if (this.resource.fsPath.endsWith('.sketch')) {
      this.webviewEditor.webview.html = await this.getWebviewContents();
      this.update();
    }
  }

  private reload(): void {
    if (this._previewState !== 'Disposed') {
      this.webviewEditor.webview.postMessage({ type: 'reload' });
    }
  }

  private update(): void {
    if (this._previewState === 'Disposed') {
      return;
    }

    if (this.webviewEditor.active) {
      this._previewState = 'Active';
      return;
    }
    this._previewState = 'Visible';
  }

  private getWebviewContents(): Promise<string> {
    return new Promise<string>((resolve) => {
      const webview = this.webviewEditor.webview;
      const cspSource = webview.cspSource;
      const resolveAsUri = (p: string): vscode.Uri => {
        const uri = vscode.Uri.file(path.join(this.extensionRoot.path, p));
        return webview.asWebviewUri(uri);
      };
      const res = fs.readFileSync(this.resource.fsPath);
      var zip = new JSZip();

      zip
        .loadAsync(res)
        .then((zipfiles: JSZip) => {
          console.log(zipfiles);

          const f = zipfiles.file('previews/preview.png');
          if (f) {
            console.log(f);
            f.async('uint8array')
              .then((image) => {
                const fileName = 'preview.png';

                const picUri = resolveAsUri(fileName);
                fs.writeFileSync(picUri.fsPath, image);
                console.log(picUri);
                resolve(`<!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <meta
                    http-equiv="Content-Security-Policy"
                    content="default-src 'none'; connect-src ${cspSource}; script-src 'unsafe-inline' ${cspSource}; style-src 'unsafe-inline' ${cspSource}; img-src blob: data: ${cspSource};"
                  />                                      
                  <title>Sketch Viewer</title>
                </head>
                <body>
                  <image src="${picUri}" />
                   
                </body>
              </html>`);
              })
              .catch((err) => {
                console.log(err);
                resolve('Fail to read sketch file!');
              });
          }
        })
        .catch((err) => {
          console.log(err);
          resolve('Fail to read sketch file!');
        });
    });
  }
}
