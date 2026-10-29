const router = require('express').Router();
const Expense = require('../models/Expense');
const { protect, allowRoles } = require('../middleware/auth');
router.use(protect);
router.get('/', async (req, res, next) => { try { res.json(await Expense.find().sort({ createdAt: -1 }).limit(500)); } catch(e) { next(e); } });
router.post('/', allowRoles('admin','manager'), async (req, res, next) => { try { const amount = Number(req.body.amount); if (!req.body.title || !Number.isFinite(amount) || amount < 0) return res.status(400).json({ message: 'A title and valid non-negative amount are required.' }); res.status(201).json(await Expense.create({ title: req.body.title, category: req.body.category || 'Other', amount, note: req.body.note || '', createdBy: req.user._id })); } catch(e) { next(e); } });
module.exports = router;
