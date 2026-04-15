const pdfParse = require('pdf-parse');
const fs = require('fs');

async function test() {
  try {
    console.log("Testing pdf-parse...");
    console.log("Type of pdfParse:", typeof pdfParse);
    console.log("Keys of pdfParse:", Object.keys(pdfParse || {}));
    
    const dummyBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF");
    const data = await (pdfParse.default || pdfParse)(dummyBuffer);
    console.log("Success! Extracted text length:", data.text.length);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
