import { Router } from 'express';
import Expense from '../models/Expense.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res) => {
  const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
  res.json(expenses);
});

router.post('/', async (req, res) => {
  try {
    const { amount, category, note, date } = req.body;
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }
    const expense = await Expense.create({
      userId: req.userId,
      amount: value,
      category: category || 'Other',
      note,
      date: date || Date.now(),
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { amount, category, note, date } = req.body;
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { amount, category, note, date },
    { new: true, runValidators: true }
  );
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
});

router.delete('/:id', async (req, res) => {
  const result = await Expense.deleteOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  res.json({ ok: true });
});

export default router;
