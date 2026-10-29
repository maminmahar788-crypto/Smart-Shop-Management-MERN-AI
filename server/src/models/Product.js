const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
  category: { type: String, default: 'General', trim: true },
  costPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockAt: { type: Number, min: 0, default: 5 },
  supplier: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });
productSchema.index({ name: 'text', sku: 'text', category: 'text' });
module.exports = mongoose.model('Product', productSchema);
