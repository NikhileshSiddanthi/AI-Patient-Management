import { Request, Response } from 'express';
import pool from '../database';
import { Patient } from '../types';

export const getPatients = async (req: Request, res: Response) => {
  try {
    const { doctorId, nurseId, search } = req.query;
    
    let query = `
      SELECT 
        p.id, p.user_id, p.date_of_birth, p.gender, p.blood_type,
        p.allergies, p.medical_history, p.emergency_contact_name,
        p.emergency_contact_phone, p.insurance_provider, p.insurance_policy_number,
        p.created_at, p.updated_at,
        u.first_name, u.last_name, u.email, u.phone
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE u.status = 'active'
    `;
    
    const queryParams: any[] = [];
    let paramCount = 1;

    if (doctorId) {
      query += ` AND p.primary_doctor_id = $${paramCount}`;
      queryParams.push(doctorId);
      paramCount++;
    }

    if (nurseId) {
      query += ` AND p.assigned_nurse_id = $${paramCount}`;
      queryParams.push(nurseId);
      paramCount++;
    }

    if (search) {
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY u.last_name, u.first_name';

    const result = await pool.query(query, queryParams);
    
    const patients = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      bloodType: row.blood_type,
      allergies: row.allergies,
      medicalHistory: row.medical_history,
      emergencyContactName: row.emergency_contact_name,
      emergencyContactPhone: row.emergency_contact_phone,
      insuranceProvider: row.insurance_provider,
      insurancePolicyNumber: row.insurance_policy_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        p.*, 
        u.first_name, u.last_name, u.email, u.phone, u.status,
        d.first_name as doctor_first_name, d.last_name as doctor_last_name,
        n.first_name as nurse_first_name, n.last_name as nurse_last_name
      FROM patients p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN users d ON p.primary_doctor_id = d.id
      LEFT JOIN users n ON p.assigned_nurse_id = n.id
      WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const row = result.rows[0];
    const patient = {
      id: row.id,
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      status: row.status,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      bloodType: row.blood_type,
      allergies: row.allergies,
      medicalHistory: row.medical_history,
      emergencyContactName: row.emergency_contact_name,
      emergencyContactPhone: row.emergency_contact_phone,
      insuranceProvider: row.insurance_provider,
      insurancePolicyNumber: row.insurance_policy_number,
      primaryDoctor: row.doctor_first_name ? {
        firstName: row.doctor_first_name,
        lastName: row.doctor_last_name,
      } : null,
      assignedNurse: row.nurse_first_name ? {
        firstName: row.nurse_first_name,
        lastName: row.nurse_last_name,
      } : null,
    };

    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Failed to fetch patient' });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      medicalHistory,
      emergencyContactName,
      emergencyContactPhone,
      insuranceProvider,
      insurancePolicyNumber,
      primaryDoctorId,
      assignedNurseId,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO patients (
        user_id, date_of_birth, gender, blood_type, allergies, 
        medical_history, emergency_contact_name, emergency_contact_phone,
        insurance_provider, insurance_policy_number, 
        primary_doctor_id, assigned_nurse_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        userId, dateOfBirth, gender, bloodType, allergies,
        medicalHistory, emergencyContactName, emergencyContactPhone,
        insuranceProvider, insurancePolicyNumber,
        primaryDoctorId, assignedNurseId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Failed to create patient' });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
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
      UPDATE patients 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Failed to update patient' });
  }
};
