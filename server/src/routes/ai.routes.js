const router = require('express').Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/insights', async (req, res, next) => { try {
 const [products, sales, expenses] = await Promise.all([Product.find({ active: true }).select('name sku stock lowStockAt costPrice salePrice').limit(1000), Sale.find().sort({createdAt:-1}).limit(500).select('total estimatedProfit items createdAt'), Expense.find({ createdAt: { $gte: new Date(Date.now()-30*86400000) } }).select('amount')]);
 const lowStock = products.filter(p => p.stock <= p.lowStockAt).map(p=>({ name:p.name, sku:p.sku, stock:p.stock, threshold:p.lowStockAt }));
 const productSales = {}; for (const sale of sales) for (const item of sale.items) { productSales[item.sku] ||= {name:item.name, quantity:0, revenue:0}; productSales[item.sku].quantity += item.quantity; productSales[item.sku].revenue += item.lineTotal; }
 const topProducts = Object.values(productSales).sort((a,b)=>b.quantity-a.quantity).slice(0,5);
 const metrics = { salesRecords: sales.length, revenue: sales.reduce((a,s)=>a+s.total,0), estimatedGrossProfit: sales.reduce((a,s)=>a+s.estimatedProfit,0), recentExpenses: expenses.reduce((a,e)=>a+e.amount,0), lowStock, topProducts };
 let answer;
 const question = String(req.query.question || '').trim();
 if (question && process.env.OPENAI_API_KEY) {
  try {
   const response = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`}, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages:[{role:'system',content:'You are a retail shop assistant. Use only supplied business data, clearly state when data is insufficient, do not invent exact figures, and treat profit as an estimate. Reply in concise helpful language.'},{role:'user',content:`Business metrics JSON: ${JSON.stringify(metrics)}\nQuestion: ${question}`}], temperature:0.2 }) });
   if (!response.ok) throw new Error('AI provider request failed'); const json = await response.json(); answer = json.choices?.[0]?.message?.content;
  } catch { answer = null; }
 }
 if (!answer) {
  if (question.toLowerCase().includes('stock') || question.toLowerCase().includes('restock')) answer = lowStock.length ? `There are ${lowStock.length} low-stock products: ${lowStock.map(p=>`${p.name} (${p.stock} left; threshold ${p.threshold})`).join(', ')}. Review recent demand and supplier lead time before ordering.` : 'No products are currently below their configured stock threshold.';
  else if (question.toLowerCase().includes('top') || question.toLowerCase().includes('best')) answer = topProducts.length ? `Top-selling products by recorded quantity: ${topProducts.map((p,i)=>`${i+1}. ${p.name}: ${p.quantity} units`).join('; ')}.` : 'There are not enough recorded sales to identify top products yet.';
  else answer = `Recorded sales in the latest 500 sale records total ${metrics.revenue.toFixed(2)} with estimated gross profit ${metrics.estimatedGrossProfit.toFixed(2)}. There are ${lowStock.length} low-stock products. Add a question about stock, top products, or sales for a more focused answer.`;
 }
 res.json({ answer, metrics, mode: process.env.OPENAI_API_KEY ? 'ai-or-fallback' : 'rule-based' });
} catch(e) { next(e); } });
module.exports = router;
