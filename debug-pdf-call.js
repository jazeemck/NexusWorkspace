const pdf = require('pdf-parse');
console.log('Type of PDFParse:', typeof pdf.PDFParse);
console.log('String(PDFParse):', String(pdf.PDFParse));

try {
    const p = new pdf.PDFParse();
    console.log('Created new PDFParse instance. Keys:', Object.keys(p));
} catch (e) {
    console.log('Failed to create new PDFParse instance:', e.message);
}

// Check for other keys that look like parse functions
const allKeys = Object.keys(pdf);
for (const k of allKeys) {
    if (typeof pdf[k] === 'function' && k.toLowerCase().includes('parse')) {
        console.log(`Found function key: ${k}`);
    }
}
