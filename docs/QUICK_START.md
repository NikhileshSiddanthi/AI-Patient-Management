# Quick Start Guide

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional but recommended)

## Installation (5 Minutes)

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `REDIS_HOST`: Redis server (or comment out for no caching)
- `JWT_SECRET`: Generate a secure random string
- `AI_SERVICE_KEY`: OpenAI API key (optional, for real AI features)

### 3. Setup Database
```bash
# Create database
createdb pms_db

# Run schema
psql pms_db < database/schema.sql
```

### 4. Start Backend
```bash
npm run dev
```
Backend will run on http://localhost:5000

### 5. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 6. Configure Frontend
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000
```

### 7. Start Frontend
```bash
npm run dev
```
Frontend will run on http://localhost:5173

## First Login

### Test Accounts
After seeding the database, you can use these test accounts:

**Admin Account:**
- Email: admin@pms.com
- Password: admin123

**Doctor Account:**
- Email: doctor@pms.com
- Password: doctor123

**Nurse Account:**
- Email: nurse@pms.com
- Password: nurse123

**Patient Account:**
- Email: patient@pms.com
- Password: patient123

## Features by Role

### Admin Dashboard
- Manage all users (doctors, nurses, patients)
- View system statistics and health
- Access audit logs
- Configure security settings

### Doctor Dashboard
- View and manage patients
- Schedule appointments
- Create medical records
- Review lab results
- Access AI clinical tools

### Nurse Dashboard
- Monitor patient vital signs
- Administer medications
- Track critical alerts
- Manage patient care tasks

### Patient Dashboard
- View appointments
- Access medical records
- Use AI symptom checker
- View prescriptions and lab results

## Using AI Features

### Symptom Checker
1. Go to Patient Dashboard
2. Scroll to AI Symptom Checker section
3. Describe symptoms in detail
4. Click "Analyze Symptoms"
5. Review AI recommendations

**Note**: For production, configure `AI_SERVICE_KEY` in backend `.env` with your OpenAI API key.

## Real-Time Notifications

WebSocket notifications work automatically when:
1. Backend WebSocket server is running (port 5000)
2. Frontend is connected
3. Look for green dot on notification bell icon

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Vite automatically reloads on file changes
- Backend: Uses `nodemon` for automatic restart

### Database Changes
After modifying `database/schema.sql`:
```bash
psql pms_db < database/schema.sql
```

### API Testing
Use curl, Postman, or Thunder Client:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pms.com","password":"admin123"}'

# Get patients (replace TOKEN)
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer TOKEN"
```

### Debugging
- Backend logs: Console output shows all requests
- Frontend: React DevTools + Browser console
- Database: Check PostgreSQL logs
- Redis: `redis-cli monitor`

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in .env
- Ensure database exists: `psql -l`

### Frontend API Errors
- Verify backend is running on port 5000
- Check VITE_API_URL in frontend/.env
- Check CORS settings in backend

### WebSocket Not Connecting
- Ensure backend WebSocket server is running
- Check browser console for connection errors
- Verify no firewall blocking WebSocket connections

## Production Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Add environment variable: `VITE_API_URL`
4. Deploy automatically

See `docs/FRONTEND_DEPLOYMENT.md` for details.

### Backend (Railway/Render)
1. Push to GitHub
2. Connect repository
3. Add PostgreSQL and Redis add-ons
4. Configure environment variables
5. Deploy

See `docs/BACKEND_DEPLOYMENT.md` for detailed cloud deployment guides.

## Getting Help

- Check `README.md` for overview
- Review `/docs` folder for deployment guides
- Check API types in `backend/src/types/index.ts`
- Review database schema in `backend/database/schema.sql`

## Next Steps

1. ✅ Test all dashboards with different user roles
2. ✅ Explore AI symptom checker
3. ✅ Create sample data for testing
4. ✅ Configure real AI services for production
5. ✅ Setup email/SMS notifications
6. ✅ Deploy to production

---

**Happy coding!** 🚀
