# Patient Management System - Quick Setup & Test Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### 1. Database Setup (2 minutes)
```bash
# Create database
createdb pms_db

# Run schema
cd patient-management-system
psql pms_db < backend/database/schema.sql

# Verify
psql pms_db -c "\dt"  # Should show 15+ tables
```

### 2. Backend Setup (2 minutes)
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env:
# DATABASE_URL=postgresql://localhost/pms_db
# JWT_SECRET=your-secret-key-here
# PORT=5000

# Seed database with test data
npm run seed

# Start server
npm run dev
```

**Expected Output:**
```
🌱 Database seeding completed!
✅ Created 10 users
✅ Created 5 patients
✅ Created 4 appointments
...
Server running on port 5000
```

### 3. Frontend Setup (1 minute)
```bash
cd ../frontend
npm install

# Configure
cp .env.example .env
# Edit .env:
# VITE_API_URL=http://localhost:5000

# Start
npm run dev
```

Visit: **http://localhost:5173**

## 🔐 Test Accounts

All passwords: `password123`

| Role | Email | Features |
|------|-------|----------|
| **Admin** | admin@pms.com | User management, system stats, audit logs |
| **Doctor** | sarah.johnson@pms.com | Patient records, appointments, prescriptions |
| **Doctor** | michael.chen@pms.com | Patient records, appointments, prescriptions |
| **Nurse** | emily.davis@pms.com | Vital signs, medications, patient care |
| **Nurse** | robert.martinez@pms.com | Vital signs, medications, patient care |
| **Patient** | john.smith@patient.com | View appointments, medical records, AI checker |

## ✅ Quick Test Checklist

### Admin Dashboard
1. Login as `admin@pms.com`
2. Check Users tab - should see 10 users
3. Check System Stats - should show live counts
4. Check Audit Logs - should show seed entry
5. Try searching/filtering users

### Doctor Dashboard
1. Login as `sarah.johnson@pms.com`
2. Check Patients tab - should see assigned patients
3. Check Today's Appointments - should see scheduled appointments
4. Click into Medical Records tab
5. Try creating a new medical record

### Nurse Dashboard
1. Login as `emily.davis@pms.com`
2. Check Vital Signs - should see records with color-coded status
3. Check Medications - should see pending medications
4. Try administering a medication
5. Check for critical alerts banner

### Patient Dashboard
1. Login as `john.smith@patient.com`
2. View your appointments
3. Check medical records
4. View prescriptions
5. **Try AI Symptom Checker**:
   - Enter: "I have a fever and cough for 3 days"
   - Click "Analyze Symptoms"
   - Should get diagnosis with recommendations

## 🔍 API Testing

### Test Endpoints with curl

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pms.com","password":"password123"}'

# Save the token from response

# Get patients (replace YOUR_TOKEN)
curl http://localhost:5000/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get system stats
curl http://localhost:5000/api/v1/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# AI Symptom Check
curl -X POST http://localhost:5000/api/v1/ai/symptom-check \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symptoms":"fever and cough"}'
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check database connection
psql pms_db -c "SELECT version();"

# Check if port is in use
lsof -i:5000

# Check environment variables
cat backend/.env
```

### Frontend API errors
```bash
# Verify backend is running
curl http://localhost:5000/health

# Check frontend env
cat frontend/.env

# Check browser console for CORS errors
```

### Database errors
```bash
# Re-run schema
psql pms_db < backend/database/schema.sql

# Re-seed data
cd backend && npm run seed

# Check database
psql pms_db -c "SELECT COUNT(*) FROM users;"
```

### No data showing in dashboards
```bash
# Make sure seed ran successfully
cd backend && npm run seed

# Check database has data
psql pms_db -c "SELECT * FROM users LIMIT 5;"

# Verify API returns data
curl http://localhost:5000/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Database Verification

```sql
-- Check all tables have data
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'medical_records', COUNT(*) FROM medical_records
UNION ALL
SELECT 'prescriptions', COUNT(*) FROM prescriptions
UNION ALL
SELECT 'vital_signs', COUNT(*) FROM vital_signs;
```

Expected results:
- users: 10
- patients: 5
- appointments: 4
- medical_records: 3
- prescriptions: 3
- vital_signs: 3

## 🚀 Ready for Production?

### Checklist
- [ ] All test accounts work
- [ ] All dashboards load correctly
- [ ] CRUD operations work (create, read, update)
- [ ] Search and filtering work
- [ ] AI Symptom Checker responds
- [ ] Real-time notifications appear
- [ ] No console errors in browser
- [ ] Backend logs look clean

### Deploy
1. **Backend**: See `docs/BACKEND_DEPLOYMENT.md`
2. **Frontend**: See `docs/FRONTEND_DEPLOYMENT.md`
3. **Configure OpenAI** (optional): Set `OPENAI_API_KEY` for real AI

## 💡 Tips

- **Resetting Database**: Just re-run `npm run seed`
- **Adding More Data**: Edit `backend/src/seed.ts` and re-run
- **Testing AI with Real API**: Get OpenAI key and set in backend `.env`
- **Debugging**: Check browser console and backend terminal logs

## 📞 Need Help?

1. Check `docs/PROJECT_SUMMARY.md` for complete feature list
2. Check `docs/IMPLEMENTATION_COMPLETE.md` for technical details
3. Check `README.md` for architecture overview
4. Review database schema in `backend/database/schema.sql`

---

**Status**: ✅ Fully functional with real database operations  
**Version**: 2.0.0  
**Last Updated**: 2025-11-01
