import { Request, Response } from 'express';
import pool from '../database';

export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId } = req.query;
    
    let query = `
      SELECT 
        mr.id, mr.patient_id, mr.doctor_id, mr.visit_date,
        mr.diagnosis, mr.symptoms, mr.treatment, mr.notes,
        mr.follow_up_required, mr.follow_up_date, mr.created_at,
        p_user.first_name as patient_first_name,
        p_user.last_name as patient_last_name,
        d_user.first_name as doctor_first_name,
        d_user.last_name as doctor_last_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN users p_user ON p.user_id = p_user.id
      JOIN users d_user ON mr.doctor_id = d_user.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramCount = 1;

    if (patientId) {
      query += ` AND mr.patient_id = $${paramCount}`;
      queryParams.push(patientId);
      paramCount++;
    }

    if (doctorId) {
      query += ` AND mr.doctor_id = $${paramCount}`;
      queryParams.push(doctorId);
      paramCount++;
    }

    query += ' ORDER BY mr.visit_date DESC, mr.created_at DESC';

    const result = await pool.query(query, queryParams);
    
    const records = result.rows.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      doctorId: row.doctor_id,
      patientName: `${row.patient_first_name} ${row.patient_last_name}`,
      doctorName: `${row.doctor_first_name} ${row.doctor_last_name}`,
      visitDate: row.visit_date,
      recordDate: row.visit_date,
      diagnosis: row.diagnosis,
      symptoms: row.symptoms,
      treatment: row.treatment,
      notes: row.notes,
      followUpRequired: row.follow_up_required,
      followUpDate: row.follow_up_date,
      createdAt: row.created_at,
    }));

    res.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ message: 'Failed to fetch medical records' });
  }
};

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      doctorId,
      visitDate,
      diagnosis,
      symptoms,
      treatment,
      notes,
      followUpRequired,
      followUpDate,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO medical_records (
        patient_id, doctor_id, visit_date, diagnosis, symptoms,
        treatment, notes, follow_up_required, follow_up_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        patientId, doctorId, visitDate, diagnosis, symptoms,
        treatment, notes, followUpRequired, followUpDate,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ message: 'Failed to create medical record' });
  }
};

export const updateMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE medical_records 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ message: 'Failed to update medical record' });
  }
};
