/**
 * Standard compliant PDF 1.4 generator for YCCify Academic Resources
 * Generates valid multi-page PDFs that open in any browser or PDF reader.
 */

export function createAcademicPdf(
  title: string,
  courseCode: string,
  courseName: string,
  faculty: string,
  unitTopic: string,
  pagesContent: string[]
): Buffer {
  const objects: string[] = [];
  const byteOffsets: number[] = [];

  function addObject(content: string): number {
    const id = objects.length + 1;
    objects.push(content);
    return id;
  }

  // Pre-allocate object IDs
  // 1: Catalog
  // 2: Outlines
  // 3: Pages
  // 4: Font Helvetica
  // 5: Font Helvetica-Bold
  // Then for each page: Page object + Content stream object

  const numPages = pagesContent.length;
  const pageObjectIds: number[] = [];

  // Placeholder indices
  const fontRegularId = 4;
  const fontBoldId = 5;

  let nextObjId = 6;
  const pageData: Array<{ pageId: number; streamId: number; text: string }> = [];

  for (let i = 0; i < numPages; i++) {
    const pageId = nextObjId++;
    const streamId = nextObjId++;
    pageObjectIds.push(pageId);
    pageData.push({ pageId, streamId, text: pagesContent[i] });
  }

  // Build Objects
  // 1. Catalog
  objects.push(`<< /Type /Catalog /Pages 3 0 R /Outlines 2 0 R >>`);

  // 2. Outlines
  objects.push(`<< /Type /Outlines /Count 0 >>`);

  // 3. Pages Tree
  const kidsStr = pageObjectIds.map((id) => `${id} 0 R`).join(' ');
  objects.push(`<< /Type /Pages /Kids [ ${kidsStr} ] /Count ${numPages} >>`);

  // 4. Font Helvetica
  objects.push(`<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>`);

  // 5. Font Helvetica-Bold
  objects.push(`<< /Type /Font /Subtype /Type1 /Name /F2 /BaseFont /Helvetica-Bold >>`);

  // Pages & Streams
  pageData.forEach((item, index) => {
    // Page Object
    objects.push(
      `<< /Type /Page /Parent 3 0 R /MediaBox [ 0 0 612 792 ] /Contents ${item.streamId} 0 R /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> >>`
    );

    // Stream Content
    const pageNum = index + 1;
    const lines = item.text.split('\n');

    let stream = `BT\n`;
    // Header
    stream += `/F2 16 Tf\n50 740 Td\n(YCCify - Yeshwantrao Chavan College of Engineering) Tj\n`;
    stream += `/F1 11 Tf\n0 -20 Td\n(${courseCode} - ${courseName} | ${faculty}) Tj\n`;
    stream += `/F2 14 Tf\n0 -30 Td\n(${title}) Tj\n`;
    stream += `/F1 10 Tf\n0 -18 Td\n(Topic: ${unitTopic}) Tj\n`;
    stream += `0 -25 Td\n`;

    // Horizontal line
    stream += `ET\n`;
    stream += `q 0.1 w 0.2 0.35 0.95 rg 50 635 512 2 re f Q\n`;
    stream += `BT\n`;

    // Body content
    stream += `/F1 11 Tf\n50 610 Td\n`;
    let currentY = 610;
    for (const line of lines) {
      if (line.startsWith('# ')) {
        const h1 = line.replace('# ', '').replace(/[()]/g, '');
        stream += `/F2 13 Tf\n(${h1}) Tj\n/F1 11 Tf\n0 -22 Td\n`;
      } else if (line.startsWith('## ')) {
        const h2 = line.replace('## ', '').replace(/[()]/g, '');
        stream += `/F2 11 Tf\n(${h2}) Tj\n/F1 10 Tf\n0 -18 Td\n`;
      } else if (line.startsWith('- ')) {
        const bullet = line.replace(/[()]/g, '');
        stream += `(   * ${bullet.substring(2)}) Tj\n0 -16 Td\n`;
      } else if (line.trim().length > 0) {
        const clean = line.replace(/[()]/g, '');
        stream += `(${clean}) Tj\n0 -15 Td\n`;
      } else {
        stream += `0 -10 Td\n`;
      }
    }

    // Footer
    stream += `ET\n`;
    stream += `BT\n/F1 9 Tf\n50 40 Td\n(YCCify Academic Platform - Approved Academic Resource | Nagpur, MH) Tj\n`;
    stream += `450 0 Td\n(Page ${pageNum} of ${numPages}) Tj\nET\n`;

    const streamLength = Buffer.byteLength(stream, 'utf-8');
    objects.push(`<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`);
  });

  // Assemble full PDF
  let pdf = `%PDF-1.4\n%âãÏÓ\n`;
  const offsets: number[] = [];

  objects.forEach((obj, idx) => {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf-8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  offsets.forEach((offset) => {
    const pad = String(offset).padStart(10, '0');
    pdf += `${pad} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf-8');
}

