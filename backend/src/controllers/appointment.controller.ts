import { Request, Response } from 'express';
import pool from '../database';

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, status, date } = req.query;
    
    let query = `
      SELECT 
        a.id, a.patient_id, a.doctor_id, a.appointment_date, 
        a.appointment_time, a.duration_minutes, a.type, a.status,
        a.reason, a.notes, a.created_at, a.updated_at,
        p_user.first_name as patient_first_name, 
        p_user.last_name as patient_last_name,
        d_user.first_name as doctor_first_name,
        d_user.last_name as doctor_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users p_user ON p.user_id = p_user.id
      JOIN users d_user ON a.doctor_id = d_user.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramCount = 1;

    if (patientId) {
      query += ` AND a.patient_id = $${paramCount}`;
      queryParams.push(patientId);
      paramCount++;
    }

    if (doctorId) {
      query += ` AND a.doctor_id = $${paramCount}`;
      queryParams.push(doctorId);
      paramCount++;
    }

    if (status) {
      query += ` AND a.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (date) {
      query += ` AND a.appointment_date = $${paramCount}`;
      queryParams.push(date);
      paramCount++;
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const result = await pool.query(query, queryParams);
    
    const appointments = result.rows.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      doctorId: row.doctor_id,
      patientName: `${row.patient_first_name} ${row.patient_last_name}`,
      doctorName: `${row.doctor_first_name} ${row.doctor_last_name}`,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      durationMinutes: row.duration_minutes,
      type: row.type,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      durationMinutes,
      type,
      reason,
      notes,
    } = req.body;

    // Check for conflicts
    const conflictCheck = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 
       AND appointment_date = $2 
       AND appointment_time = $3
       AND status != 'cancelled'`,
      [doctorId, appointmentDate, appointmentTime]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Appointment slot already booked' 
      });
    }

    const result = await pool.query(
      `INSERT INTO appointments (
        patient_id, doctor_id, appointment_date, appointment_time,
        duration_minutes, type, status, reason, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8)
      RETURNING *`,
      [
        patientId, doctorId, appointmentDate, appointmentTime,
        durationMinutes || 30, type, reason, notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const result = await pool.query(
      `UPDATE appointments 
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Failed to cancel appointment' });
  }
};
