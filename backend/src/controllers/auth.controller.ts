import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import db from '../database';
import { hashPassword, comparePassword, generateToken, generateRefreshToken, generateMedicalRecordNumber } from '../utils/auth';
import { AppError, asyncHandler } from '../middleware/error';
import { LoginRequest, RegisterRequest, UserRole } from '../types';

class AuthController {
  public register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password, role, firstName, lastName, phone, dateOfBirth, gender }: RegisterRequest = req.body;

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Start transaction
    const result = await db.transaction(async (client) => {
      // Create user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, date_of_birth, gender, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, email, role, first_name, last_name, phone, date_of_birth, gender, status, created_at`,
        [email, passwordHash, role, firstName, lastName, phone, dateOfBirth, gender, 'active']
      );

      const user = userResult.rows[0];

      // If patient, create patient record
      if (role === 'patient') {
        const mrn = generateMedicalRecordNumber();
        await client.query(
          `INSERT INTO patients (user_id, medical_record_number) VALUES ($1, $2)`,
          [user.id, mrn]
        );
      }

      // If doctor or nurse, create medical_staff record
      if (role === 'doctor' || role === 'nurse') {
        const licenseNumber = `LIC-${Date.now()}-${Math.random().toString(36).substring(7)}`.toUpperCase();
        await client.query(
          `INSERT INTO medical_staff (user_id, license_number) VALUES ($1, $2)`,
          [user.id, licenseNumber]
        );
      }

      return user;
    });

    // Generate tokens
    const token = generateToken(result);
    const refreshToken = generateRefreshToken(result);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.id,
          email: result.email,
          role: result.role,
          firstName: result.first_name,
          lastName: result.last_name,
        },
        token,
        refreshToken,
      },
      message: 'Registration successful',
    });
  });

  public login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user
    const result = await db.query(
      `SELECT id, email, password_hash, role, first_name, last_name, phone, status 
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      throw new AppError('Account is suspended or inactive', 403);
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        token,
        refreshToken,
      },
      message: 'Login successful',
    });
  });

  public getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const result = await db.query(
      `SELECT id, email, role, first_name, last_name, phone, date_of_birth, gender, status, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        status: user.status,
        createdAt: user.created_at,
      },
    });
  });

  public refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      const result = await db.query(
        'SELECT id, email, role FROM users WHERE id = $1 AND status = $2',
        [decoded.id, 'active']
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid refresh token', 401);
      }

      const user = result.rows[0];
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  });
}

export default new AuthController();

// Need to import verifyRefreshToken
import { verifyRefreshToken } from '../utils/auth';
