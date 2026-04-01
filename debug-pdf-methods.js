const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse;

console.log('PDFParse keys (static):', Object.keys(PDFParse));

try {
    const instance = new PDFParse({}); // Empty options
    console.log('Instance creation successful!');
    console.log('Instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
} catch (e) {
    console.log('Failed to instantiate with {}:', e.message);
}
