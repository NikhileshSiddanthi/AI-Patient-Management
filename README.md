# Patient Management System

## Overview

A comprehensive, enterprise-grade patient management system with advanced AI integration, built with modern technologies and optimized for deployment on Vercel (frontend) and cloud platforms (backend).

## Features

### Core Features
- **Multi-Role Authentication** - Secure login for Admin, Doctor, Nurse, and Patient roles
- **Patient Management** - Comprehensive patient profiles and medical records
- **Advanced Appointment Scheduling** - AI-optimized scheduling with conflict detection
- **Real-time Collaboration** - WebSocket-based notifications and updates
- **Medical Document Management** - Secure storage with AI processing
- **Prescription Management** - Electronic prescribing with refill tracking
- **Lab Results Management** - Integrated lab ordering and results viewing
- **Billing & Insurance** - Automated billing with insurance integration

### AI-Powered Features
1. **Smart Symptom Checker** - AI-powered initial triage system
2. **Appointment Optimization** - AI-driven scheduling and resource allocation
3. **Predictive Analytics** - Risk assessment and outcome prediction
4. **Natural Language Processing** - Automated medical documentation
5. **Treatment Recommendations** - Evidence-based AI suggestions
6. **Intelligent Search** - Semantic search across medical records
7. **Automated Documentation** - AI-generated reports and summaries
8. **Patient Monitoring Alerts** - AI-powered critical change notifications

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Charts:** Recharts
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Caching:** Redis
- **Authentication:** JWT
- **Real-time:** WebSockets
- **Security:** Helmet, CORS, bcryptjs
- **Deployment:** Railway, AWS, Render, or DigitalOcean

## Project Structure

```
patient-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── database/          # Database config and models
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   ├── routes/            # API routes
│   │   ├── services/          # AI and business logic
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Helper functions
│   │   └── server.ts          # Main server file
│   ├── database/
│   │   └── schema.sql         # Database schema
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # State management
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Helper functions
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── docs/
    ├── BACKEND_DEPLOYMENT.md  # Backend deployment guide
    └── FRONTEND_DEPLOYMENT.md # Frontend deployment guide
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Git

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database:**
```bash
# Create PostgreSQL database
createdb pms_db

# Run migrations
psql -U postgres -d pms_db -f database/schema.sql
```

5. **Start development server:**
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit VITE_API_URL if needed
```

4. **Start development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Deployment

### 🚀 Quick Deploy Buttons

[![Deploy Frontend to Vercel](https://vercel.com/button)](https://vercel.com/import/git?s=https://github.com/yourusername/patient-management-system)
[![Deploy Backend to Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

### Frontend Deployment to Vercel

**One-Click Deploy:**
1. Click the "Deploy to Vercel" button above
2. Connect your GitHub repository
3. Configure environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_NODE_ENV=production
   ```
4. Deploy automatically

**Manual Deploy:**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Backend Deployment

**Railway (Recommended):**
```bash
npm install -g @railway/cli
cd backend
railway login
railway init
railway up
```

**Render:**
1. Connect GitHub repo to Render.com
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Configure environment variables

**DigitalOcean App Platform:**
1. Create new app from GitHub
2. Configure build and run commands
3. Add PostgreSQL and Redis services

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.

## Environment Variables

### Backend
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
JWT_SECRET=your_secret_key
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Frontend
```env
VITE_API_URL=https://your-backend-url.railway.app/api/v1
```

## Security & Compliance

### HIPAA Compliance
- Encryption at rest and in transit
- Role-based access control (RBAC)
- Comprehensive audit logging
- Secure authentication with JWT
- Session management with Redis
- Data retention policies

### Security Features
- Bcrypt password hashing
- Rate limiting on API endpoints
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention

## API Documentation

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh-token` - Refresh JWT token

### Patients
- `GET /api/v1/patients` - List patients (Doctor/Nurse/Admin)
- `GET /api/v1/patients/:id` - Get patient details
- `PUT /api/v1/patients/:id` - Update patient

### Appointments
- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Create appointment
- `PUT /api/v1/appointments/:id` - Update appointment

### AI Services
- `POST /api/v1/ai/symptom-checker` - AI symptom analysis
- `POST /api/v1/ai/optimize-appointment` - AI scheduling optimization
- `POST /api/v1/ai/predictive-analytics` - Risk assessment

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Performance Optimization

### Frontend
- Code splitting with React.lazy
- Image optimization
- Caching strategies
- Bundle size optimization with Vite

### Backend
- Database indexing
- Redis caching
- Connection pooling
- Rate limiting

## Monitoring & Logging

- Application logs with Morgan
- Error tracking
- Performance monitoring
- Audit trail for compliance

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check documentation in `/docs`
- Review deployment guides
- Check application logs for errors

## Acknowledgments

- Built with modern best practices from leading healthcare systems
- AI features inspired by latest healthcare AI research
- Security implementations following HIPAA guidelines
- UX patterns based on healthcare design standards

## Authors

**MiniMax Agent** - Initial work and development

---

**Note:** This is a production-grade system. Ensure proper security measures, regular backups, and compliance with healthcare regulations before deploying to production.
