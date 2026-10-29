const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema({ title: { type: String, required: true, trim: true }, category: { type: String, default: 'Other' }, amount: { type: Number, required: true, min: 0 }, note: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });
module.exports = mongoose.model('Expense', expenseSchema);
