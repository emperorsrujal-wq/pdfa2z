import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

async function createSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  page.drawText('Sample PDF for Testing', {
    x: 50,
    y: 350,
    size: 30,
    color: rgb(0, 0.53, 0.71),
  });
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('sample.pdf', pdfBytes);
  console.log('Sample PDF created at sample.pdf');
}

createSamplePdf();
