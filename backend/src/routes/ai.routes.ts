import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

import { analyzeSymptoms } from '../services/ai.service';

// AI-powered Symptom Checker
router.post('/symptom-checker', async (req, res, next) => {
  try {
    const { symptoms, medicalHistory, testResults } = req.body;
    const analysis = await analyzeSymptoms(symptoms, medicalHistory, testResults);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Appointment Optimization
router.post('/optimize-appointment', authorize('patient', 'doctor', 'nurse'), async (req, res, next) => {
  res.json({ success: true, message: 'Appointment optimization endpoint' });
});

// Predictive Analytics
router.post('/predictive-analytics', authorize('doctor', 'admin'), async (req, res, next) => {
  res.json({ success: true, message: 'Predictive analytics endpoint' });
});

// Document Analysis
router.post('/analyze-document', authorize('doctor', 'nurse', 'admin'), async (req, res, next) => {
  res.json({ success: true, message: 'Document analysis endpoint' });
});

// Treatment Recommendations
router.post('/treatment-recommendations', authorize('doctor'), async (req, res, next) => {
  res.json({ success: true, message: 'Treatment recommendations endpoint' });
});

export default router;
