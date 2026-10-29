const router = require('express').Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const { protect, allowRoles } = require('../middleware/auth');
const { invoicePdf } = require('../services/pdf.service');
router.use(protect);
router.get('/', async (req, res, next) => { try { const rows = await Sale.find().sort({ createdAt: -1 }).limit(200).populate('createdBy', 'name'); res.json(rows); } catch(e) { next(e); } });
router.post('/', async (req, res, next) => {
  const changed = [];
  try {
    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    if (!rawItems.length) return res.status(400).json({ message: 'Add at least one item to the sale.' });
    const discount = Number(req.body.discount || 0);
    if (!Number.isFinite(discount) || discount < 0) return res.status(400).json({ message: 'Discount must be zero or more.' });
    const items = []; let subtotal = 0, estimatedCost = 0;
    for (const line of rawItems) {
      const quantity = Number(line.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) throw Object.assign(new Error('Each quantity must be a positive whole number.'), { status: 400 });
      const product = await Product.findOneAndUpdate({ _id: line.productId, active: true, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
      if (!product) throw Object.assign(new Error('Product not found or not enough stock. Refresh inventory and try again.'), { status: 400 });
      changed.push({ id: product._id, quantity });
      const lineTotal = Number((product.salePrice * quantity).toFixed(2));
      subtotal += lineTotal; estimatedCost += product.costPrice * quantity;
      items.push({ product: product._id, name: product.name, sku: product.sku, quantity, unitPrice: product.salePrice, unitCost: product.costPrice, lineTotal });
    }
    if (discount > subtotal) throw Object.assign(new Error('Discount cannot exceed subtotal.'), { status: 400 });
    const total = Number((subtotal - discount).toFixed(2));
    const sale = await Sale.create({ invoiceNo: `SS-${Date.now()}-${Math.floor(Math.random()*900+100)}`, items, subtotal: Number(subtotal.toFixed(2)), discount, total, estimatedCost: Number(estimatedCost.toFixed(2)), estimatedProfit: Number((total - estimatedCost).toFixed(2)), customerName: String(req.body.customerName || 'Walk-in customer').slice(0, 120), paymentMethod: ['cash','card','bank','other'].includes(req.body.paymentMethod) ? req.body.paymentMethod : 'cash', createdBy: req.user._id });
    res.status(201).json(sale);
  } catch(e) {
    // Best-effort stock compensation if a later item or sale save fails.
    await Promise.all(changed.map(x => Product.updateOne({ _id: x.id }, { $inc: { stock: x.quantity } }).catch(() => null)));
    next(e);
  }
});
router.get('/:id/pdf', async (req, res, next) => { try { const sale = await Sale.findById(req.params.id); if (!sale) return res.status(404).json({ message: 'Sale not found.' }); invoicePdf(sale, res); } catch(e) { next(e); } });
router.delete('/:id', allowRoles('admin'), (req, res) => res.status(405).json({ message: 'Sales cannot be deleted from this starter app. Use a documented refund workflow instead.' }));
module.exports = router;
