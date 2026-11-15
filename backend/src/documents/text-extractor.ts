import { BadRequestException, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';
// We import pdf-parse's inner file, not the package root: the root file runs a self-test that tries to
// open a sample PDF from disk when it thinks it is being run directly, which breaks inside a Nest app.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { extname } from 'path';

const logger = new Logger('TextExtractor');

/**
 * Reads the plain text out of an uploaded PDF or Word (.docx) file.
 * The file type is decided by the extension, because the browser-reported mime type is unreliable.
 */
export async function extractText(file: { buffer: Buffer; originalname: string }): Promise<string> {
  const extension = extname(file.originalname).toLowerCase();

  try {
    if (extension === '.pdf') {
      return await readPdf(file.buffer);
    }
    if (extension === '.docx') {
      const word = await mammoth.extractRawText({ buffer: file.buffer });
      return word.value;
    }
  } catch (error) {
    // Corrupt / password-protected / not really a PDF or docx.
    // The employee gets a friendly message; the real reason goes to the server log for us.
    logger.warn(`Could not read "${file.originalname}": ${error instanceof Error ? error.message : String(error)}`);
    throw new BadRequestException(`Could not read "${file.originalname}". Is the file corrupt or password-protected?`);
  }

  throw new BadRequestException(
    extension === '.doc'
      ? 'Old Word files (.doc) are not supported. Please save the file as .docx and upload again.'
      : 'Only PDF (.pdf) and Word (.docx) files are supported.',
  );
}

/**
 * Reads a PDF, trying twice.
 * Some PDFs have a slightly damaged internal index ("bad XRef entry"). The PDF library fails on the
 * first attempt but rebuilds the index and succeeds on the second. Genuinely broken files still fail
 * both times and are rejected by the caller.
 */
async function readPdf(buffer: Buffer): Promise<string> {
  try {
    return (await pdfParse(buffer)).text;
  } catch {
    return (await pdfParse(buffer)).text;
  }
}

/** Tidies extracted text so it is safe to store and nice to search. */
export function cleanText(raw: string): string {
  return raw
    .replace(/\u0000/g, '') // PostgreSQL refuses text that contains NUL characters; some PDFs contain them
    .replace(/\r\n?/g, '\n') // Windows line endings -> \n
    .replace(/[ \t]+/g, ' ') // runs of spaces/tabs -> one space
    .replace(/ ?\n ?/g, '\n') // trim spaces around line breaks
    .replace(/\n{3,}/g, '\n\n') // many blank lines -> one blank line (a paragraph break)
    .trim();
}
