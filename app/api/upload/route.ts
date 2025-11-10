import { NextRequest, NextResponse } from 'next/server';
import { indexDocument } from '@/lib/engine/indexer';

export const dynamic = 'force-dynamic';

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let text = decoder.decode(uint8Array);

    text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');

    const words: string[] = [];
    let currentWord = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (/[a-zA-Z0-9]/.test(char)) {
        currentWord += char;
      } else if (currentWord) {
        words.push(currentWord);
        currentWord = '';
      }
    }

    if (currentWord) {
      words.push(currentWord);
    }

    return words.join(' ');
  } catch (error) {
    console.error('PDF extraction error:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    console.log('Upload request received, files:', files.length);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    let filesProcessed = 0;
    let totalWords = 0;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      let content = '';

      if (file.type === 'text/plain') {
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        content = await extractPdfText(arrayBuffer);

        if (!content) {
          content = `PDF file: ${file.name} (text extraction not fully supported - using basic indexing)`;
        }
      } else {
        continue;
      }

      indexDocument(file.name, content);
      filesProcessed++;
      
      console.log(`Indexed file: ${file.name}, content length: ${content.length}`);

      const wordCount = content
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0).length;
      totalWords += wordCount;
    }

    console.log(`Upload complete: ${filesProcessed} files, ${totalWords} words`);

    return NextResponse.json({
      success: true,
      filesProcessed,
      totalWords,
      message: `Successfully indexed ${filesProcessed} file(s)`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process files' },
      { status: 500 }
    );
  }
}
