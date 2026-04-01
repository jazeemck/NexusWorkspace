const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse;

const p = new PDFParse({});
let keys = [];
let obj = p;
while (obj && obj !== Object.prototype) {
    keys = keys.concat(Object.getOwnPropertyNames(obj));
    obj = Object.getPrototypeOf(obj);
}
console.log('KEYS_LIST:' + JSON.stringify([...new Set(keys)]));
