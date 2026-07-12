import { Router } from 'express';
import PomodoroSession from '../models/PomodoroSession.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.post('/', async (req, res) => {
  try {
    const { minutes, mode } = req.body;
    const value = Number(minutes);
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ message: 'Invalid session length' });
    }
    const session = await PomodoroSession.create({
      userId: req.userId,
      minutes: value,
      mode: mode || 'focus',
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const sessions = await PomodoroSession.find({
    userId: req.userId,
    mode: 'focus',
    completedAt: { $gte: startOfWeek },
  });

  let focusToday = 0;
  let focusWeek = 0;
  let sessionsToday = 0;
  for (const s of sessions) {
    focusWeek += s.minutes;
    if (s.completedAt >= startOfToday) {
      focusToday += s.minutes;
      sessionsToday += 1;
    }
  }

  res.json({ focusToday, focusWeek, sessionsToday });
});

export default router;
