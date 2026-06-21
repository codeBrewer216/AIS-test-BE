import { Injectable } from '@nestjs/common';
import { PDFDocument, PDFImage, StandardFonts, rgb } from 'pdf-lib';
import sharp from 'sharp';

const embedImage = async (
  pdfDoc: PDFDocument,
  imageUrl: string
): Promise<PDFImage> => {
  const response = await fetch(imageUrl);
  const imageBytes = Buffer.from(await response.arrayBuffer());
  const extension = imageUrl.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return await pdfDoc.embedPng(imageBytes);
    case 'jpg':
    case 'jpeg':
      return await pdfDoc.embedJpg(imageBytes);
    case 'webp': {
      const jpgBuffer = await sharp(imageBytes)
        .jpeg({ quality: 90 })
        .toBuffer();
      return await pdfDoc.embedJpg(jpgBuffer);
    }
    default:
      throw new Error(`Unsupported image format: ${extension}`);
  }

};

export default embedImage

@Injectable()
export class PdfService {
  async generatePdf(booking: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    console.log(booking)
    for (const seat of booking.seats) {

      const page = pdfDoc.addPage([500, 220]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Courier);

      const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

      // Background

      page.drawRectangle({
        x: 0,
        y: 0,
        width: 500,
        height: 220,
        color: rgb(0.98, 0.98, 0.98),
      });
      // Border
      page.drawRectangle({
        x: 5,
        y: 5,
        width: 490,
        height: 210,
        borderWidth: 1,
        borderColor: rgb(0.7, 0.7, 0.7),
      });

      // Poster Placeholder

      page.drawRectangle({
        x: 15,
        y: 20,
        width: 120,
        height: 180,
        borderWidth: 1,
        borderColor: rgb(0.5, 0.5, 0.5),
      });


      if (booking.movieId?.poster) {
        const posterImage = await embedImage(pdfDoc, booking.movieId.poster)
        page.drawImage(posterImage, {
          x: 15,
          y: 20,
          width: 120,
          height: 180,
        });
      }

      // Divider

      page.drawLine({
        start: { x: 150, y: 10 },
        end: { x: 150, y: 210 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });

      // Header
      page.drawText('MOVIE TICKET', {
        x: 160,
        y: 185,
        size: 18,
        font: boldFont,
      });

      // Movie Information

      page.drawText('Movie:', {
        x: 160,
        y: 150,
        size: 12,
        font: boldFont,
      });

      page.drawText(booking.movieId?.name || 'Unknown', {
        x: 210,
        y: 150,
        size: 12,
        font,
      });

      page.drawText('Room:', {
        x: 160,
        y: 125,
        size: 12,
        font: boldFont,
      });

      page.drawText(booking.room.replace('-', ' ') || 'Unknown', {
        x: 200,
        y: 125,
        size: 12,
        font,
      });

      page.drawText('Showtime:', {
        x: 160,
        y: 100,
        size: 12,
        font: boldFont,
      });
      // startsAt
      page.drawText(booking.startsAt ? new Date(booking.startsAt).toLocaleString() : 'Unknown', {
        x: 230,
        y: 100,
        size: 10,
        font,
      });

      page.drawText('Seats:', {
        x: 160,
        y: 75,
        size: 12,
        font: boldFont,
      });

      page.drawText(seat.seatId, {
        x: 210,
        y: 75,
        size: 12,
        font,
      });

      page.drawText('Booking ID:', {
        x: 160,
        y: 50,
        size: 12,
        font: boldFont,
      });

      page.drawText(booking._id.toString(), {
        x: 245,
        y: 50,
        size: 10,
        font,
      });

      // QR Code Placeholder

      page.drawRectangle({
        x: 400,
        y: 40,
        width: 70,
        height: 70,
        borderWidth: 1,
        borderColor: rgb(0.5, 0.5, 0.5),
      });

      page.drawText('QR', {
        x: 425,
        y: 75,
        size: 16,
        font: boldFont,
      });
    }
    return await pdfDoc.save();
  }
}