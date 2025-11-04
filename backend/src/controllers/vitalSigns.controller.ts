import { Request, Response } from 'express';
import pool from '../database';

export const getVitalSigns = async (req: Request, res: Response) => {
  try {
    const { patientId, nurseId, status } = req.query;
    
    let query = `
      SELECT 
        vs.id, vs.patient_id, vs.recorded_by_nurse_id, vs.temperature,
        vs.blood_pressure_systolic, vs.blood_pressure_diastolic,
        vs.heart_rate, vs.respiratory_rate, vs.oxygen_saturation,
        vs.notes, vs.recorded_at,
        p_user.first_name as patient_first_name,
        p_user.last_name as patient_last_name,
        n_user.first_name as nurse_first_name,
        n_user.last_name as nurse_last_name
      FROM vital_signs vs
      JOIN patients p ON vs.patient_id = p.id
      JOIN users p_user ON p.user_id = p_user.id
      JOIN users n_user ON vs.recorded_by_nurse_id = n_user.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramCount = 1;

    if (patientId) {
      query += ` AND vs.patient_id = $${paramCount}`;
      queryParams.push(patientId);
      paramCount++;
    }

    if (nurseId) {
      query += ` AND vs.recorded_by_nurse_id = $${paramCount}`;
      queryParams.push(nurseId);
      paramCount++;
    }

    query += ' ORDER BY vs.recorded_at DESC';

    const result = await pool.query(query, queryParams);
    
    const vitalSigns = result.rows.map(row => {
      const temp = parseFloat(row.temperature);
      const hr = parseInt(row.heart_rate);
      const o2 = parseInt(row.oxygen_saturation);
      const systolic = parseInt(row.blood_pressure_systolic);
      
      // Determine status based on vital signs
      let vitalStatus = 'normal';
      if (temp > 100.4 || temp < 95 || hr > 100 || hr < 60 || o2 < 90 || systolic > 140 || systolic < 90) {
        vitalStatus = 'critical';
      } else if (temp > 99.5 || hr > 90 || o2 < 95 || systolic > 130) {
        vitalStatus = 'warning';
      }

      return {
        id: row.id,
        patientId: row.patient_id,
        patientName: `${row.patient_first_name} ${row.patient_last_name}`,
        recordedByNurseId: row.recorded_by_nurse_id,
        nurseName: `${row.nurse_first_name} ${row.nurse_last_name}`,
        temperature: temp,
        bloodPressure: `${row.blood_pressure_systolic}/${row.blood_pressure_diastolic}`,
        heartRate: hr,
        respiratoryRate: parseInt(row.respiratory_rate),
        oxygenLevel: o2,
        notes: row.notes,
        recordedAt: row.recorded_at,
        status: status ? status : vitalStatus,
      };
    });

    res.json(vitalSigns);
  } catch (error) {
    console.error('Error fetching vital signs:', error);
    res.status(500).json({ message: 'Failed to fetch vital signs' });
  }
};

export const createVitalSigns = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      recordedByNurseId,
      temperature,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vital_signs (
        patient_id, recorded_by_nurse_id, temperature,
        blood_pressure_systolic, blood_pressure_diastolic,
        heart_rate, respiratory_rate, oxygen_saturation, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        patientId, recordedByNurseId, temperature,
        bloodPressureSystolic, bloodPressureDiastolic,
        heartRate, respiratoryRate, oxygenSaturation, notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vital signs:', error);
    res.status(500).json({ message: 'Failed to create vital signs' });
  }
};
