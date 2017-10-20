/**
 * detect file info
 */

import * as Fs from 'fs-extra';
import * as _ from 'lodash';
import * as Path from 'path';

import { Detector } from './detector';

export interface LineInfo {
  total: number;
  code: number;
  comment: number;
}

export interface FileInfo {
  name: string;
  lang: string;
  size: number;
  lines: LineInfo;
}

const DefaultLine: LineInfo = {
  total: 0,
  code: 0,
  comment: 0
};

const DefaultFileInfo: FileInfo = {
  name: '',
  lang: '',
  size: 0,
  lines: DefaultLine
};

/**
 * collect language info of a file
 *
 * @export
 * @class LangFile
 */
export class LangFile {
  private path: string;
  private file: File;
  private data: FileInfo;

  /**
   * Creates an instance of LangFile.
   * @param {string} filePath
   * @memberof LangFile
   */
  constructor(filePath: string) {
    if (!Fs.existsSync(filePath)) {
      throw new Error('Error in File: file now exits.');
    }

    // this.file = new File();

    this.path = filePath;
    this.data = this.getFileInfo();
  }

  /**
   * get file type through a path
   *
   * @private
   * @param {string} path
   * @returns {string}
   * @memberof LangFile
   */
  static getType(path: string): string {
    const fileExtension = '.' + path.split('.').pop();

    if (!Object.keys(Detector.extensionMap).length) {
      const detector = new Detector();
    }

    return  Detector.extensionMap[fileExtension] || '';
  }

  /**
   * optimize for more precise info
   *
   * @private
   * @param {string} data
   * @returns {LineInfo}
   * @memberof LangFile
   */
  private filteData(data: string): LineInfo {
    const lines = data.split(/\n/);
    const lineData: LineInfo = Object.assign({}, DefaultLine, {
      total: lines.length,
      code: lines.length
    });

    lines.map(line => {
      // todo: filter
      if (!line) {
        lineData.code --;
      }
    });

    return lineData;
  }

  /**
   * get file info when LangFile init
   *
   * @private
   * @returns {FileInfo}
   * @memberof LangFile
   */
  private getFileInfo(): FileInfo {
    const info: FileInfo = Object.assign({}, DefaultFileInfo);
    const name = this.path.split(Path.sep).pop() || '';
    let stat: Fs.Stats;
    let data: string;
    let lines: string[];

    try {
      stat = Fs.statSync(this.path);
      data = Fs.readFileSync(this.path, 'utf-8');
    } catch (err) {
      throw new Error('read file failed.');
    }

    lines = data.split(/\n/);
    info.name = name;
    info.size = stat && stat.size || 0;
    info.lang = LangFile.getType(this.path);
    info.lines = this.filteData(data);

    return info;
  }

  /**
   * return file path
   *
   * @returns {string}
   * @memberof LangFile
   */
  public getPath(): string {
    return this.path;
  }

  /**
   * return file info
   *
   * @returns {FileInfo}
   * @memberof LangFile
   */
  public getInfo(): FileInfo {
    return this.data;
  }
}
