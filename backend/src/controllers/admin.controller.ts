import { Request, Response } from 'express';
import pool from '../database';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, search } = req.query;
    
    let query = 'SELECT id, first_name, last_name, email, phone, role, status, created_at, last_login FROM users WHERE 1=1';
    const queryParams: any[] = [];
    let paramCount = 1;

    if (role && role !== 'all') {
      query += ` AND role = $${paramCount}`;
      queryParams.push(role);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const stats = await Promise.all([
      pool.query("SELECT COUNT(*) as total FROM users"),
      pool.query("SELECT COUNT(*) as total FROM patients"),
      pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'doctor'"),
      pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'nurse'"),
      pool.query("SELECT COUNT(*) as total FROM appointments WHERE status = 'scheduled'"),
      pool.query("SELECT COUNT(*) as total FROM medical_records"),
    ]);

    res.json({
      totalUsers: parseInt(stats[0].rows[0].total),
      totalPatients: parseInt(stats[1].rows[0].total),
      totalDoctors: parseInt(stats[2].rows[0].total),
      totalNurses: parseInt(stats[3].rows[0].total),
      activeAppointments: parseInt(stats[4].rows[0].total),
      totalRecords: parseInt(stats[5].rows[0].total),
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Failed to fetch system stats' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        al.id, al.user_id, al.action, al.details, 
        al.ip_address, al.created_at as timestamp,
        u.first_name, u.last_name
       FROM audit_logs al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );

    const logs = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: `${row.first_name} ${row.last_name}`,
      action: row.action,
      details: row.details,
      ipAddress: row.ip_address,
      timestamp: row.timestamp,
    }));

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [req.user?.id, 'UPDATE_USER_STATUS', `Updated user ${id} status to ${status}`, req.ip]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete by setting status to 'deleted'
    const result = await pool.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['deleted', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [req.user?.id, 'DELETE_USER', `Deleted user ${id}`, req.ip]
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
