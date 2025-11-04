import express from 'express';
import * as medicationController from '../controllers/medication.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/prescriptions', medicationController.getPrescriptions);
router.get('/medications', medicationController.getMedications);
router.patch('/medications/:id', medicationController.updateMedicationStatus);

export default router;
