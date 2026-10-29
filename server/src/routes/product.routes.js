const router = require('express').Router();
const Product = require('../models/Product');
const { protect, allowRoles } = require('../middleware/auth');
router.use(protect);
router.get('/', async (req, res, next) => { try {
  const filter = { active: true };
  if (req.query.search) filter.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { sku: { $regex: req.query.search, $options: 'i' } }, { category: { $regex: req.query.search, $options: 'i' } }];
  if (req.query.lowStock === 'true') filter.$expr = { $lte: ['$stock', '$lowStockAt'] };
  res.json(await Product.find(filter).sort({ createdAt: -1 }).limit(500));
} catch(e) { next(e); } });
router.post('/', allowRoles('admin', 'manager'), async (req, res, next) => { try {
  const body = req.body;
  if (!body.name || !body.sku || !Number.isFinite(Number(body.costPrice)) || !Number.isFinite(Number(body.salePrice)) || Number(body.stock) < 0) return res.status(400).json({ message: 'Name, SKU, valid prices and stock are required.' });
  const product = await Product.create({ name: body.name, sku: body.sku, category: body.category || 'General', costPrice: Number(body.costPrice), salePrice: Number(body.salePrice), stock: Number(body.stock), lowStockAt: Number(body.lowStockAt ?? 5), supplier: body.supplier || '' });
  res.status(201).json(product);
} catch(e) { if (e.code === 11000) return res.status(409).json({ message: 'SKU already exists.' }); next(e); } });
router.put('/:id', allowRoles('admin', 'manager'), async (req, res, next) => { try {
  const allowed = ['name', 'sku', 'category', 'costPrice', 'salePrice', 'stock', 'lowStockAt', 'supplier']; const data = {};
  for (const key of allowed) if (req.body[key] !== undefined) data[key] = req.body[key];
  for (const key of ['costPrice', 'salePrice', 'stock', 'lowStockAt']) if (data[key] !== undefined) data[key] = Number(data[key]);
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' }); res.json(product);
} catch(e) { if (e.code === 11000) return res.status(409).json({ message: 'SKU already exists.' }); next(e); } });
router.delete('/:id', allowRoles('admin', 'manager'), async (req, res, next) => { try { const p = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true }); if (!p) return res.status(404).json({ message: 'Product not found.' }); res.json({ message: 'Product archived.' }); } catch(e) { next(e); } });
module.exports = router;
