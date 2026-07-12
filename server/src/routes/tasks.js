import { Router } from 'express';
import Task from '../models/Task.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

const dayStr = (d = new Date()) => {
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  return new Date(dt.getTime() - off * 60000).toISOString().slice(0, 10);
};

router.get('/', async (req, res) => {
  const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

router.post('/', async (req, res) => {
  try {
    const { title, description, type, priority, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const task = await Task.create({
      userId: req.userId,
      title: title.trim(),
      description,
      type,
      priority,
      dueDate: dueDate || null,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { title, description, type, priority, dueDate } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { title, description, type, priority, dueDate: dueDate || null },
    { new: true, runValidators: true }
  );
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

router.patch('/:id/toggle', async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (task.type === 'daily') {
    const today = dayStr();
    if (task.lastCompletedDate === today) {
      task.lastCompletedDate = null;
      task.streak = Math.max(0, task.streak - 1);
    } else {
      const yesterday = dayStr(new Date(Date.now() - 86400000));
      task.streak = task.lastCompletedDate === yesterday ? task.streak + 1 : 1;
      task.lastCompletedDate = today;
    }
  } else {
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
  }

  await task.save();
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const result = await Task.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.json({ ok: true });
});

export default router;
