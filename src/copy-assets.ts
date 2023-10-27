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
  SignatureReflection,
  DeclarationReflection,
} from 'typedoc';
import { Node } from 'typescript';

import {
  CopyAssetsOptions,
  defaultOptions,
  optionsKey,
} from './copy-assets-options';

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
  private _reflectionPaths: Map<Reflection, string[]> = new Map();
  /** Maps an image absolute path to a relative path in the output. */
  private _referencePathMaps: Map<string, string> = new Map();
  /** Path that we already used. */
  private _usedOutputPaths: Set<string> = new Set();

  /**
   * The pattern used to find references in markdown.
   */
  private _referencePattern = /(\[.*?\]\()(.*?)(\))/g;
  private _imagePattern = /(!\[.*?\]\()(.*?)(\))/g;

  private _options: CopyAssetsOptions = defaultOptions;
  private _includeList?: RegExp[];
  private _excludeList?: RegExp[];

  /**
   * Create a new RelativeIncludesConverterComponent instance.
   * @param typedoc The application.
   */
  public initialize(typedoc: Readonly<Application>): void {
    this._typedoc = typedoc;

    typedoc.converter.on(
      Converter.EVENT_CREATE_DECLARATION,
      (c: Readonly<Context>, r: Reflection, n: Node) => {
        const filePath = this.getFolderPaths(n, r, c);

        if (!filePath) return;
        this._reflectionPaths.set(r, filePath);
      }
    );

    typedoc.renderer.on(Renderer.EVENT_BEGIN, () => {
      this._outFolder = this._typedoc?.options.getValue('out');
      this._options =
        <CopyAssetsOptions>this._typedoc?.options.getValue(optionsKey) ??
        defaultOptions;

      this._includeList = this._options.include
        ? this._options.include.map((m) => new RegExp(m))
        : undefined;
      this._excludeList = this._options.exclude
        ? this._options.exclude.map((m) => new RegExp(m))
        : undefined;

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

        const folderPaths = this._reflectionPaths.get(currentReflection);

        if (!folderPaths) return;

        event.parsedText = this.processText(
          event.parsedText,
          folderPaths,
          currentOutputFilePath
        );
      },
      undefined,
      1 // Do it before the default
    );
  }

  /**
   * Get the folder path for the current item.
   * @param n Node.
   * @param r Reflection.
   * @param c Context.
   * @returns The folder path for the current context item or undefined.
   */
  private getFolderPaths(
    n: Node,
    r: Reflection,
    c: Readonly<Context>
  ): string[] | undefined {
    if (r.parent) {
      const filePath = this.getNodeFilePath(n) ?? this.getReflectionFilePath(r);
      return filePath ? [path.dirname(filePath)] : undefined;
    } else {
      const result: string[] = [];
      const filePath = this.getReflectionFilePath(r);
      if (filePath) {
        result.push(path.dirname(filePath));
      }
      result.push(c.program.getCurrentDirectory());
      return result;
    }
  }

  /**
   * Get the first file the reflection was created from.
   * @param reflection The reflection.
   * @returns The file path.
   */
  private getReflectionFilePath(reflection: Reflection): string | undefined {
    if (
      reflection.variant !== 'signature' &&
      reflection.variant !== 'declaration'
    )
      return;
    const sourceVariant = reflection as
      | SignatureReflection
      | DeclarationReflection;

    if (!sourceVariant.sources || sourceVariant.sources.length === 0) return;

    return sourceVariant.sources[0].fileName;
  }

  /**
   * Get the file the node was created from.
   * @param node The node.
   * @returns The file path.
   */
  private getNodeFilePath(node: Node): string | undefined {
    if (!node) return undefined;
    if ('fileName' in node) return <string | undefined>node['fileName'];

    return this.getNodeFilePath(node.parent);
  }

  /**
   * Process the text collecting the references from it and copying to the out folder.
   * @param text The text to process.
   * @param originalFolderPath Path of the parsed file.
   * @param originalFolderPaths
   * @param outputFilePath Path of the documentation file.
   * @returns The modified comment.
   */
  private processText(
    text: string,
    originalFolderPaths: string[],
    outputFilePath: string
  ): string {
    return text.replace(
      this._options.onlyImages ? this._imagePattern : this._referencePattern,
      (_match, prefix, pathGroup, suffix) => {
        if (
          typeof pathGroup === 'string' &&
          (pathGroup.startsWith('./') || pathGroup.startsWith('../')) &&
          (!this._includeList ||
            this._includeList.some((s) => s.test(_match))) &&
          (!this._excludeList || !this._excludeList.some((s) => s.test(_match)))
        ) {
          let referencePath: string | undefined;

          for (const p of originalFolderPaths) {
            const possiblePath = path.join(p, pathGroup);
            if (fs.existsSync(possiblePath)) {
              referencePath = possiblePath;
              break;
            }
          }

          if (!referencePath) {
            console.warn(
              `Missing file on relative paths: ${pathGroup}, paths tried: [${originalFolderPaths.join(
                ', '
              )}]`
            );

            return prefix + pathGroup + suffix;
          }

          let newPath = this._referencePathMaps.get(referencePath);

          if (!newPath) {
            const ext = path.extname(referencePath);
            const fileName = path.basename(referencePath, ext);
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
            this._referencePathMaps.set(referencePath, newPath);

            // console.log(
            //   `Copy ${referencePath} => ${newPath}, exists: ${fs.existsSync(
            //     referencePath
            //   )}`
            // );
            fs.copyFileSync(referencePath, newPath);
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
