const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
const corsOptions = {
  origin: [
    'https://ai-patient-management-32bj-54ze92ujs.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
};

// Health check endpoint
module.exports = async (req, res) => {
  try {
    // Apply CORS and security headers
    cors(corsOptions)(req, res, () => {});
    helmet()(req, res, () => {});

    // Route handling
    const { url, method } = req;
    
    // Health check
    if (req.url === '/health' || req.url === '/api/health') {
      return res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'AI Patient Management API',
        version: '2.0.0'
      });
    }

    // API routing
    const path = url.replace('/api', '') || '/';
    
    switch (method) {
      case 'GET':
        await handleGetRequest(path, req, res);
        break;
      case 'POST':
        await handlePostRequest(path, req, res);
        break;
      case 'PUT':
        await handlePutRequest(path, req, res);
        break;
      case 'DELETE':
        await handleDeleteRequest(path, req, res);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// GET request handlers
async function handleGetRequest(path, req, res) {
  switch (path) {
    case '/':
    case '/ping':
      res.json({ 
        message: 'AI Patient Management API is running',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      });
      break;
      
    case '/patients':
      await getPatients(req, res);
      break;
      
    case '/appointments':
      await getAppointments(req, res);
      break;
      
    case '/analytics':
      await getAnalytics(req, res);
      break;
      
    default:
      res.status(404).json({ error: 'Endpoint not found' });
  }
}

// POST request handlers
async function handlePostRequest(path, req, res) {
  switch (path) {
    case '/auth/login':
      await login(req, res);
      break;
      
    case '/auth/register':
      await register(req, res);
      break;
      
    case '/patients':
      await createPatient(req, res);
      break;
      
    case '/appointments':
      await createAppointment(req, res);
      break;
      
    case '/ai/analyze':
      await analyzeWithAI(req, res);
      break;
      
    default:
      res.status(404).json({ error: 'Endpoint not found' });
  }
}

// PUT request handlers
async function handlePutRequest(path, req, res) {
  switch (path) {
    case '/patients':
      await updatePatient(req, res);
      break;
      
    case '/appointments':
      await updateAppointment(req, res);
      break;
      
    default:
      res.status(404).json({ error: 'Endpoint not found' });
  }
}

// DELETE request handlers
async function handleDeleteRequest(path, req, res) {
  switch (path) {
    case '/patients':
      await deletePatient(req, res);
      break;
      
    case '/appointments':
      await deleteAppointment(req, res);
      break;
      
    default:
      res.status(404).json({ error: 'Endpoint not found' });
  }
}

// Auth functions
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // For demo purposes, return a mock response
    // In production, verify against database
    res.json({
      success: true,
      token: 'mock_jwt_token',
      user: {
        id: 'user-123',
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
}

async function register(req, res) {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // For demo purposes, return a mock response
    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: 'user-' + Date.now(),
        email,
        firstName,
        lastName,
        role: role || 'patient'
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
}

// Patient management functions
async function getPatients(req, res) {
  try {
    // For demo purposes, return mock data
    res.json({
      patients: [
        {
          id: 'patient-1',
          name: 'John Doe',
          email: 'john@example.com',
          dateOfBirth: '1990-01-15',
          phone: '+1234567890',
          status: 'active',
          lastVisit: '2024-01-15'
        }
      ],
      total: 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
}

async function createPatient(req, res) {
  try {
    const patientData = req.body;
    
    // For demo purposes, return mock response
    res.json({
      success: true,
      patient: {
        id: 'patient-' + Date.now(),
        ...patientData,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
}

async function updatePatient(req, res) {
  try {
    const patientId = req.query.id;
    const updateData = req.body;
    
    // For demo purposes, return mock response
    res.json({
      success: true,
      patient: {
        id: patientId,
        ...updateData,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
}

async function deletePatient(req, res) {
  try {
    const patientId = req.query.id;
    
    // For demo purposes, return mock response
    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
}

// Appointment management functions
async function getAppointments(req, res) {
  try {
    // For demo purposes, return mock data
    res.json({
      appointments: [
        {
          id: 'appointment-1',
          patientId: 'patient-1',
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          date: '2024-02-01T10:00:00Z',
          status: 'scheduled',
          notes: 'Regular checkup'
        }
      ],
      total: 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
}

async function createAppointment(req, res) {
  try {
    const appointmentData = req.body;
    
    // For demo purposes, return mock response
    res.json({
      success: true,
      appointment: {
        id: 'appointment-' + Date.now(),
        ...appointmentData,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
}

async function updateAppointment(req, res) {
  try {
    const appointmentId = req.query.id;
    const updateData = req.body;
    
    // For demo purposes, return mock response
    res.json({
      success: true,
      appointment: {
        id: appointmentId,
        ...updateData,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
}

async function deleteAppointment(req, res) {
  try {
    const appointmentId = req.query.id;
    
    // For demo purposes, return mock response
    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
}

// AI Analysis functions
async function analyzeWithAI(req, res) {
  try {
    const { symptoms, medicalHistory, testResults } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        error: 'OpenAI API key not configured',
        suggestion: 'This is a demo response for AI analysis'
      });
    }

    const prompt = `
      Analyze the following medical information:
      Symptoms: ${symptoms}
      Medical History: ${medicalHistory}
      Test Results: ${testResults}
      
      Provide a professional medical analysis and recommendations.
      Always include disclaimers about consulting healthcare professionals.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant. Provide helpful analysis while emphasizing the need for professional medical consultation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      success: true,
      analysis,
      confidence: 0.85,
      recommendations: [
        'Consult with a healthcare professional',
        'Monitor symptoms closely',
        'Keep detailed records of changes'
      ],
      disclaimer: 'This AI analysis is for informational purposes only and should not replace professional medical advice.'
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    
    // Return demo response if OpenAI fails
    res.json({
      success: true,
      analysis: 'Demo: This would contain AI-powered analysis of symptoms and medical data.',
      confidence: 0.85,
      recommendations: [
        'Consult with a healthcare professional',
        'Monitor symptoms closely',
        'Keep detailed records of any changes'
      ],
      disclaimer: 'This is a demo response. Configure OpenAI API key for real AI analysis.',
      note: 'AI analysis temporarily unavailable - showing demo response'
    });
  }
}

// Analytics functions
async function getAnalytics(req, res) {
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
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}