const router = require('express').Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/summary', async (req, res, next) => { try {
 const now = new Date(); const startToday = new Date(now); startToday.setHours(0,0,0,0); const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
 const [productCount, lowStockCount, inventory, todaySales, monthSales, expenses] = await Promise.all([
  Product.countDocuments({ active: true }), Product.countDocuments({ active: true, $expr: { $lte: ['$stock', '$lowStockAt'] } }), Product.find({ active: true }).select('stock costPrice'),
  Sale.find({ createdAt: { $gte: startToday } }).select('total estimatedProfit'), Sale.find({ createdAt: { $gte: startMonth } }).select('total estimatedProfit'), Expense.find({ createdAt: { $gte: startMonth } }).select('amount')
 ]);
 const sum = (arr, key) => arr.reduce((a, x) => a + Number(x[key] || 0), 0);
 res.json({ productCount, lowStockCount, inventoryValue: inventory.reduce((a,p)=>a+p.stock*p.costPrice,0), today: { sales: sum(todaySales,'total'), estimatedProfit: sum(todaySales,'estimatedProfit'), orders: todaySales.length }, month: { sales: sum(monthSales,'total'), estimatedProfit: sum(monthSales,'estimatedProfit'), orders: monthSales.length, expenses: sum(expenses,'amount') } });
} catch(e) { next(e); } });
router.get('/top-products', async (req, res, next) => { try { const sales = await Sale.aggregate([{ $unwind: '$items' }, { $group: { _id: '$items.sku', name: { $first: '$items.name' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: '$items.lineTotal' } } }, { $sort: { quantity: -1 } }, { $limit: 10 }]); res.json(sales); } catch(e) { next(e); } });
module.exports = router;
