import fs = require('fs');
import path = require('path');

import {
  Application,
  Context,
  Converter,
  MarkdownEvent,
  PageEvent,
  Reflection,
  Renderer,
} from 'typedoc';
import { Node } from 'typescript';

/**
 * Copies the assets found in comments to the output assets folder.
 */
export class CopyAssets {
  /** The current application. */
  private _typedoc?: Readonly<Application>;
  /** Path for output. */
  private _outFolder?: string;
  /** Path for output medias. */
  private _outMediaFolder?: string;
  /** Maps a reflection to a source file it was created from. */
  private _reflectionPaths: Map<Reflection, string> = new Map();
  /** Maps an image absolute path to a relative path in the output. */
  private _imagePathMaps: Map<string, string> = new Map();
  /** Path that we already used. */
  private _usedOutputPaths: Set<string> = new Set();

  /**
   * The pattern used to find references in markdown.
   */
  private _imagePattern = /(!\[.*?\]\()(.*?)(\))/g;

  /**
   * Create a new RelativeIncludesConverterComponent instance.
   *
   * @param typedoc The application.
   */
  public initialize(typedoc: Readonly<Application>): void {
    this._typedoc = typedoc;

    typedoc.converter.on(
      Converter.EVENT_CREATE_DECLARATION,
      (c: Readonly<Context>, r: Reflection, n: Node) => {
        const filePath = this.getNodeFilePath(n);
        if (!filePath) return;
        this._reflectionPaths.set(r, filePath);
      }
    );

    typedoc.renderer.on(Renderer.EVENT_BEGIN, () => {
      this._outFolder = this._typedoc?.options.getValue('out');

      if (!this._outFolder) return;

      this._outMediaFolder = path.join(this._outFolder, 'assets', 'media');
      if (!fs.existsSync(this._outMediaFolder)) {
        fs.mkdirSync(this._outMediaFolder, { recursive: true });
      }
    });

    let currentReflection: Reflection | undefined = undefined;
    let currentOutputFilePath: string | undefined = undefined;

    typedoc.renderer.on(PageEvent.BEGIN, (event: PageEvent) => {
      currentOutputFilePath = event.url;
      currentReflection =
        event.model instanceof Reflection ? event.model : undefined;
    });

    typedoc.renderer.on(
      MarkdownEvent.PARSE,
      (event: MarkdownEvent) => {
        if (!currentOutputFilePath) return;
        if (!currentReflection) return;
        if (!this._outMediaFolder) return;

        const filePath = this._reflectionPaths.get(currentReflection);

        if (!filePath) return;

        event.parsedText = this.processText(
          event.parsedText,
          filePath,
          currentOutputFilePath
        );
      },
      undefined,
      1 // Do it before the default
    );
  }

  /**
   * Get the file the node was created from.
   *
   * @param node The node.
   * @returns The file path.
   */
  private getNodeFilePath(node: Node): string | undefined {
    if (!node) return undefined;
    if ('fileName' in node) return node['fileName'];

    return this.getNodeFilePath(node.parent);
  }

  /**
   * Processes a text collecting the images from it and copying to the out folder.
   *
   * @param text The text to process.
   * @param originalFilePath Path of the parsed file.
   * @param outputFilePath Path of the documentation file.
   * @returns The modified comment.
   */
  private processText(
    text: string,
    originalFilePath: string,
    outputFilePath: string
  ): string {
    return text.replace(
      this._imagePattern,
      (_match, prefix, pathGroup, suffix) => {
        if (
          typeof pathGroup === 'string' &&
          (pathGroup.startsWith('./') || pathGroup.startsWith('../'))
        ) {
          const imagePath = path.join(
            path.dirname(originalFilePath),
            pathGroup
          );

          let newPath = this._imagePathMaps.get(imagePath);

          if (!newPath) {
            const ext = path.extname(imagePath);
            const fileName = path.basename(imagePath, ext);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            newPath = path.join(this._outMediaFolder!, fileName + ext);

            let index = 0;
            while (this._usedOutputPaths.has(newPath)) {
              newPath = path.join(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this._outMediaFolder!,
                `${fileName}_${index++}${ext}`
              );
            }

            this._usedOutputPaths.add(newPath);
            this._imagePathMaps.set(imagePath, newPath);

            fs.copyFileSync(imagePath, newPath);
          }

          return (
            prefix +
            path
              .relative(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                path.dirname(path.join(this._outFolder!, outputFilePath)),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                newPath
              )
              .replace(/\\/g, '/') +
            suffix
          );
        } else {
          return _match;
        }
      }
    );
  }
}
