import { NextRequest, NextResponse } from 'next/server';
// No top-level import for pdf-parse to avoid build issues with its internal test files


export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        if (file.type === "application/pdf") {
            const pdf = require('pdf-parse');
            const data = await pdf(buffer);
            return NextResponse.json({ text: data.text });
        } else {
            const text = buffer.toString('utf-8');
            return NextResponse.json({ text });
        }
    } catch (error: any) {
        console.error("Extraction Error:", error);
        return NextResponse.json({ error: error.message || "Extraction failed" }, { status: 500 });
    }
}
