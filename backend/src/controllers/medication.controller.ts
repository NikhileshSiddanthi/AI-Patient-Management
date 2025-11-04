import { Request, Response } from 'express';
import pool from '../database';

export const getPrescriptions = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, status } = req.query;
    
    let query = `
      SELECT 
        pr.id, pr.patient_id, pr.doctor_id, pr.medication_name,
        pr.dosage, pr.frequency, pr.duration, pr.start_date,
        pr.end_date, pr.refills_allowed, pr.refills_remaining,
        pr.status, pr.instructions, pr.created_at,
        p_user.first_name as patient_first_name,
        p_user.last_name as patient_last_name,
        d_user.first_name as doctor_first_name,
        d_user.last_name as doctor_last_name
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN users p_user ON p.user_id = p_user.id
      JOIN users d_user ON pr.doctor_id = d_user.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramCount = 1;

    if (patientId) {
      query += ` AND pr.patient_id = $${paramCount}`;
      queryParams.push(patientId);
      paramCount++;
    }

    if (doctorId) {
      query += ` AND pr.doctor_id = $${paramCount}`;
      queryParams.push(doctorId);
      paramCount++;
    }

    if (status) {
      query += ` AND pr.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    query += ' ORDER BY pr.created_at DESC';

    const result = await pool.query(query, queryParams);
    
    const prescriptions = result.rows.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      doctorId: row.doctor_id,
      patientName: `${row.patient_first_name} ${row.patient_last_name}`,
      doctorName: `${row.doctor_first_name} ${row.doctor_last_name}`,
      medicationName: row.medication_name,
      dosage: row.dosage,
      frequency: row.frequency,
      duration: row.duration,
      startDate: row.start_date,
      endDate: row.end_date,
      refillsAllowed: row.refills_allowed,
      refillsRemaining: row.refills_remaining,
      status: row.status,
      instructions: row.instructions,
      createdAt: row.created_at,
    }));

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
};

export const getMedications = async (req: Request, res: Response) => {
  try {
    const { patientId, nurseId, status } = req.query;
    
    let query = `
      SELECT 
        ma.id, ma.patient_id, ma.prescription_id, ma.administered_by_nurse_id,
        ma.scheduled_time, ma.administered_time, ma.status, ma.notes,
        pr.medication_name, pr.dosage, pr.frequency,
        p_user.first_name as patient_first_name,
        p_user.last_name as patient_last_name
      FROM medication_administration ma
      JOIN prescriptions pr ON ma.prescription_id = pr.id
      JOIN patients p ON ma.patient_id = p.id
      JOIN users p_user ON p.user_id = p_user.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramCount = 1;

    if (patientId) {
      query += ` AND ma.patient_id = $${paramCount}`;
      queryParams.push(patientId);
      paramCount++;
    }

    if (nurseId) {
      query += ` AND ma.administered_by_nurse_id = $${paramCount}`;
      queryParams.push(nurseId);
      paramCount++;
    }

    if (status) {
      query += ` AND ma.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    query += ' ORDER BY ma.scheduled_time DESC';

    const result = await pool.query(query, queryParams);
    
    const medications = result.rows.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: `${row.patient_first_name} ${row.patient_last_name}`,
      medicationName: row.medication_name,
      dosage: row.dosage,
      frequency: row.frequency,
      scheduledTime: row.scheduled_time,
      administeredTime: row.administered_time,
      status: row.status,
      notes: row.notes,
    }));

    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: 'Failed to fetch medications' });
  }
};

export const updateMedicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, administeredByNurseId, notes } = req.body;

    const result = await pool.query(
      `UPDATE medication_administration 
       SET status = $1,
           administered_by_nurse_id = $2,
           administered_time = CASE WHEN $1 = 'administered' THEN CURRENT_TIMESTAMP ELSE administered_time END,
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [status, administeredByNurseId, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medication record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating medication status:', error);
    res.status(500).json({ message: 'Failed to update medication status' });
  }
};
