// The pdf-parse package ships no types for its inner file. We import that inner file directly
// (see text-extractor.ts for why), so we declare the tiny part of its API that we use.
declare module 'pdf-parse/lib/pdf-parse.js' {
  function pdfParse(data: Buffer): Promise<{ text: string; numpages: number }>;
  export default pdfParse;
}
