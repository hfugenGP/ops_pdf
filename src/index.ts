import * as fs from 'fs';
import * as PdfParse from 'pdf-parse';

export default class OpsPdf {

    private _original: string;
    private _renamed: string;
    private _split: string;
    private _unitRegEx: RegExp;
    private _fileNamePrefix: string;

    constructor() {
        this._original = '/mnt/c/Work_Related/OPS_PDF/original/';
        this._renamed = '/mnt/c/Work_Related/OPS_PDF/renamed/';
        this._split = '/mnt/c/Work_Related/OPS_PDF/split/';
        this._unitRegEx = /([A-Z]{1,}\-[A-Z0-9]{1,}\-[A-Z0-9]{1,})/;
        this._fileNamePrefix = 'INV MCMF 1.9.21';
    }

    public init(): void {
        try {
            if (!this._folderExists(this._split)) {
                throw new Error(`Directory: ${this._split} does not exist.`);
            }

            const contents = this._folderContents(this._split);
            if (contents.length < 1) {
                throw new Error(`Directory: ${this._split} is empty.`);
            }
            contents.forEach((content: string) => {
                if (content.substr(content.lastIndexOf('.') + 1, content.length) === 'pdf') {
                    let originalFileName = `${this._split}${content}`;
                    this._parsePdf(originalFileName).then((response) => {
                        if (response && response != '') {
                            let unit = this._regExUnit(response);
                            if (unit && unit !== null) {
                                let newFile = `${this._renamed}${this._fileNamePrefix}_${unit}.pdf`;
                                console.log(`Renaming ${originalFileName} to ${newFile}`);
                                let res = this._renamePdf(originalFileName, newFile);
                                console.log(res);
                            }
                        }
                    }).catch((error) => {
                        console.log(error);
                    });                    
                }
            });
        } catch (error) {
            if (error.message) {
                console.log(error.message);
            } else {
                console.log(error);
            }
        }
    }

    private _folderExists(folder: string): boolean {
        let exists: boolean = false;
        if (fs.existsSync(folder)) {
            exists = true;
        }
        return exists;
    }

    private _folderContents(folder: string): Array<any> {
        const contents = fs.readdirSync(folder);
        return contents;
    }

    private _renamePdf(originalFileName: string, newFileName: string): void {
        let counter: number = 1;
        if (fs.existsSync(newFileName)) {            
            let altFileName = newFileName.substring(0, newFileName.lastIndexOf('_') - 1) + ` (${counter})` + newFileName.substring(newFileName.lastIndexOf('_'), newFileName.length);
            while(fs.existsSync(altFileName)) {
                counter += 1;
                altFileName = newFileName.substring(0, newFileName.lastIndexOf('_') - 1) + ` (${counter})` + newFileName.substring(newFileName.lastIndexOf('_'), newFileName.length);
            }
            counter = 0;
            return fs.renameSync(originalFileName, altFileName);
        }
        return fs.renameSync(originalFileName, newFileName);
    }

    private _regExUnit(content: string): string | null {
        let unitName = null;
        if (content && content.trim() !== '') {
            let result = content.match(this._unitRegEx);
            if (result && result.length > 0) {
                unitName = result[0];
            }
        }
        return unitName ;
    }

    private _parsePdf(filePath: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let dataBuffer = fs.readFileSync(filePath);
            PdfParse(dataBuffer).then((data) => {
                resolve(data.text);
            }).catch((error) => {
                reject(error);
            });
        });
    }
}

const opsPdf = new OpsPdf();
opsPdf.init();