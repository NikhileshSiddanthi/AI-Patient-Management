import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get analytics data
router.get('/', authorize('doctor', 'admin'), async (req, res, next) => {
  try {
    // For demo purposes, return mock analytics data
    res.json({
      overview: {
        totalPatients: 156,
        todayAppointments: 8,
        activeTreatments: 23,
        aiAnalyzesCompleted: 45
      },
      trends: [
        {
          period: '2024-01',
          patients: 120,
          appointments: 340
        },
        {
          period: '2024-02',
          patients: 156,
          appointments: 420
        }
      ]
    });
  } catch (error) {
    next(error);
  }
});

export default router;
