const PDFDocument = require('pdfkit');
function invoicePdf(sale, res) {
  const doc = new PDFDocument({ margin: 48 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${sale.invoiceNo || 'invoice'}.pdf"`);
  doc.pipe(res);
  doc.fontSize(22).text('SMART SHOP', { align: 'center' });
  doc.moveDown(0.5).fontSize(11).text(`Invoice: ${sale.invoiceNo}`);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`);
  doc.text(`Customer: ${sale.customerName || 'Walk-in customer'}`);
  doc.moveDown().fontSize(12).text('Items', { underline: true });
  sale.items.forEach((item) => doc.fontSize(10).text(`${item.name} (${item.sku})  x ${item.quantity}  @ ${item.unitPrice.toFixed(2)}  = ${item.lineTotal.toFixed(2)}`));
  doc.moveDown().fontSize(11).text(`Subtotal: ${Number(sale.subtotal).toFixed(2)}`, { align: 'right' });
  doc.text(`Discount: ${Number(sale.discount || 0).toFixed(2)}`, { align: 'right' });
  doc.fontSize(15).text(`TOTAL: ${Number(sale.total).toFixed(2)}`, { align: 'right' });
  doc.moveDown().fontSize(9).text('Thank you for shopping with us!', { align: 'center' });
  doc.end();
}
module.exports = { invoicePdf };
