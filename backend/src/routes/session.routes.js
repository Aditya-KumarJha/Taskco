import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getActiveSessions,
  getSessionStatistics,
  revokeSpecificSession,
  revokeOtherSessions,
  revokeAllSessions,
} from '../controllers/session.controller.js';

const router = Router();

router.get('/', protect, getActiveSessions);

router.get('/stats', protect, getSessionStatistics);

router.delete('/:sessionId', protect, revokeSpecificSession);

router.post('/revoke-others', protect, revokeOtherSessions);

router.post('/revoke-all', protect, revokeAllSessions);

export default router;
