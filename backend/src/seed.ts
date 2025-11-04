import pool from './database';
import bcrypt from 'bcryptjs';

interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🧹 Cleaning existing data...');
    await pool.query('TRUNCATE TABLE medication_administration CASCADE');
    await pool.query('TRUNCATE TABLE prescriptions CASCADE');
    await pool.query('TRUNCATE TABLE vital_signs CASCADE');
    await pool.query('TRUNCATE TABLE lab_results CASCADE');
    await pool.query('TRUNCATE TABLE medical_records CASCADE');
    await pool.query('TRUNCATE TABLE appointments CASCADE');
    await pool.query('TRUNCATE TABLE patients CASCADE');
    await pool.query('TRUNCATE TABLE audit_logs CASCADE');
    await pool.query('TRUNCATE TABLE users CASCADE');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    console.log('👥 Creating users...');
    const users: User[] = [
      // Admin
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@pms.com',
        password: hashedPassword,
        phone: '+1234567890',
        role: 'admin',
      },
      // Doctors
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@pms.com',
        password: hashedPassword,
        phone: '+1234567891',
        role: 'doctor',
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@pms.com',
        password: hashedPassword,
        phone: '+1234567892',
        role: 'doctor',
      },
      // Nurses
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@pms.com',
        password: hashedPassword,
        phone: '+1234567893',
        role: 'nurse',
      },
      {
        firstName: 'Robert',
        lastName: 'Martinez',
        email: 'robert.martinez@pms.com',
        password: hashedPassword,
        phone: '+1234567894',
        role: 'nurse',
      },
      // Patients
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@patient.com',
        password: hashedPassword,
        phone: '+1234567895',
        role: 'patient',
      },
      {
        firstName: 'Mary',
        lastName: 'Williams',
        email: 'mary.williams@patient.com',
        password: hashedPassword,
        phone: '+1234567896',
        role: 'patient',
      },
      {
        firstName: 'James',
        lastName: 'Brown',
        email: 'james.brown@patient.com',
        password: hashedPassword,
        phone: '+1234567897',
        role: 'patient',
      },
      {
        firstName: 'Patricia',
        lastName: 'Taylor',
        email: 'patricia.taylor@patient.com',
        password: hashedPassword,
        phone: '+1234567898',
        role: 'patient',
      },
      {
        firstName: 'David',
        lastName: 'Anderson',
        email: 'david.anderson@patient.com',
        password: hashedPassword,
        phone: '+1234567899',
        role: 'patient',
      },
    ];

    const createdUsers: any[] = [];
    for (const user of users) {
      const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')
         RETURNING *`,
        [user.firstName, user.lastName, user.email, user.password, user.phone, user.role]
      );
      createdUsers.push(result.rows[0]);
      console.log(`  ✓ Created ${user.role}: ${user.firstName} ${user.lastName}`);
    }

    // Get specific user IDs
    const admin = createdUsers.find(u => u.role === 'admin');
    const doctors = createdUsers.filter(u => u.role === 'doctor');
    const nurses = createdUsers.filter(u => u.role === 'nurse');
    const patientUsers = createdUsers.filter(u => u.role === 'patient');

    // Create patient records
    console.log('\n🏥 Creating patient records...');
    const patients: any[] = [];
    const patientData = [
      {
        dateOfBirth: '1985-03-15',
        gender: 'male',
        bloodType: 'O+',
        allergies: 'Penicillin',
        medicalHistory: 'Hypertension, Type 2 Diabetes',
      },
      {
        dateOfBirth: '1992-07-22',
        gender: 'female',
        bloodType: 'A+',
        allergies: 'None',
        medicalHistory: 'Asthma',
      },
      {
        dateOfBirth: '1978-11-10',
        gender: 'male',
        bloodType: 'B+',
        allergies: 'Latex',
        medicalHistory: 'Heart disease',
      },
      {
        dateOfBirth: '1995-05-30',
        gender: 'female',
        bloodType: 'AB+',
        allergies: 'Sulfa drugs',
        medicalHistory: 'None',
      },
      {
        dateOfBirth: '1980-09-18',
        gender: 'male',
        bloodType: 'O-',
        allergies: 'None',
        medicalHistory: 'Arthritis',
      },
    ];

    for (let i = 0; i < patientUsers.length; i++) {
      const data = patientData[i % patientData.length];
      const result = await pool.query(
        `INSERT INTO patients (
          user_id, date_of_birth, gender, blood_type, allergies, medical_history,
          emergency_contact_name, emergency_contact_phone,
          insurance_provider, insurance_policy_number,
          primary_doctor_id, assigned_nurse_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          patientUsers[i].id,
          data.dateOfBirth,
          data.gender,
          data.bloodType,
          data.allergies,
          data.medicalHistory,
          'Emergency Contact',
          '+1987654321',
          'Blue Cross Blue Shield',
          'POLICY' + (i + 1000),
          doctors[i % doctors.length].id,
          nurses[i % nurses.length].id,
        ]
      );
      patients.push(result.rows[0]);
      console.log(`  ✓ Created patient: ${patientUsers[i].first_name} ${patientUsers[i].last_name}`);
    }

    // Create appointments
    console.log('\n📅 Creating appointments...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = [
      {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        date: today.toISOString().split('T')[0],
        time: '09:00:00',
        type: 'checkup',
        status: 'scheduled',
        reason: 'Annual physical examination',
      },
      {
        patientId: patients[1].id,
        doctorId: doctors[1].id,
        date: today.toISOString().split('T')[0],
        time: '10:30:00',
        type: 'follow-up',
        status: 'scheduled',
        reason: 'Asthma follow-up',
      },
      {
        patientId: patients[2].id,
        doctorId: doctors[0].id,
        date: tomorrow.toISOString().split('T')[0],
        time: '14:00:00',
        type: 'consultation',
        status: 'scheduled',
        reason: 'Chest pain evaluation',
      },
      {
        patientId: patients[3].id,
        doctorId: doctors[1].id,
        date: nextWeek.toISOString().split('T')[0],
        time: '11:00:00',
        type: 'checkup',
        status: 'scheduled',
        reason: 'General checkup',
      },
    ];

    for (const apt of appointments) {
      await pool.query(
        `INSERT INTO appointments (
          patient_id, doctor_id, appointment_date, appointment_time,
          duration_minutes, type, status, reason
        ) VALUES ($1, $2, $3, $4, 30, $5, $6, $7)`,
        [apt.patientId, apt.doctorId, apt.date, apt.time, apt.type, apt.status, apt.reason]
      );
      console.log(`  ✓ Created appointment for patient`);
    }

    // Create medical records
    console.log('\n📋 Creating medical records...');
    const medicalRecords = [
      {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        visitDate: '2024-10-15',
        diagnosis: 'Hypertension - Stage 1',
        symptoms: 'Elevated blood pressure, occasional headaches',
        treatment: 'Prescribed Lisinopril 10mg daily, lifestyle modifications',
      },
      {
        patientId: patients[1].id,
        doctorId: doctors[1].id,
        visitDate: '2024-10-20',
        diagnosis: 'Asthma - Mild persistent',
        symptoms: 'Shortness of breath, wheezing',
        treatment: 'Prescribed Albuterol inhaler as needed, daily corticosteroid inhaler',
      },
      {
        patientId: patients[2].id,
        doctorId: doctors[0].id,
        visitDate: '2024-10-25',
        diagnosis: 'Coronary artery disease',
        symptoms: 'Chest pain on exertion, fatigue',
        treatment: 'Prescribed aspirin, statin therapy, cardiac rehabilitation referral',
      },
    ];

    for (const record of medicalRecords) {
      await pool.query(
        `INSERT INTO medical_records (
          patient_id, doctor_id, visit_date, diagnosis, symptoms, treatment,
          follow_up_required
        ) VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [
          record.patientId,
          record.doctorId,
          record.visitDate,
          record.diagnosis,
          record.symptoms,
          record.treatment,
        ]
      );
      console.log(`  ✓ Created medical record`);
    }

    // Create prescriptions
    console.log('\n💊 Creating prescriptions...');
    const prescriptions = [
      {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        medicationName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '90 days',
        startDate: '2024-10-15',
      },
      {
        patientId: patients[1].id,
        doctorId: doctors[1].id,
        medicationName: 'Albuterol',
        dosage: '90mcg',
        frequency: 'As needed',
        duration: '30 days',
        startDate: '2024-10-20',
      },
      {
        patientId: patients[2].id,
        doctorId: doctors[0].id,
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        duration: '90 days',
        startDate: '2024-10-25',
      },
    ];

    const createdPrescriptions: any[] = [];
    for (const rx of prescriptions) {
      const endDate = new Date(rx.startDate);
      endDate.setDate(endDate.getDate() + parseInt(rx.duration));
      
      const result = await pool.query(
        `INSERT INTO prescriptions (
          patient_id, doctor_id, medication_name, dosage, frequency,
          duration, start_date, end_date, refills_allowed, refills_remaining, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 3, 3, 'active')
        RETURNING *`,
        [
          rx.patientId,
          rx.doctorId,
          rx.medicationName,
          rx.dosage,
          rx.frequency,
          rx.duration,
          rx.startDate,
          endDate.toISOString().split('T')[0],
        ]
      );
      createdPrescriptions.push(result.rows[0]);
      console.log(`  ✓ Created prescription: ${rx.medicationName}`);
    }

    // Create vital signs
    console.log('\n❤️  Creating vital signs...');
    const vitalSigns = [
      {
        patientId: patients[0].id,
        nurseId: nurses[0].id,
        temperature: 98.6,
        bpSystolic: 145,
        bpDiastolic: 92,
        heartRate: 78,
        respiratoryRate: 16,
        oxygenSaturation: 98,
      },
      {
        patientId: patients[1].id,
        nurseId: nurses[1].id,
        temperature: 98.2,
        bpSystolic: 118,
        bpDiastolic: 76,
        heartRate: 72,
        respiratoryRate: 18,
        oxygenSaturation: 96,
      },
      {
        patientId: patients[2].id,
        nurseId: nurses[0].id,
        temperature: 99.1,
        bpSystolic: 138,
        bpDiastolic: 88,
        heartRate: 82,
        respiratoryRate: 20,
        oxygenSaturation: 95,
      },
    ];

    for (const vs of vitalSigns) {
      await pool.query(
        `INSERT INTO vital_signs (
          patient_id, recorded_by_nurse_id, temperature,
          blood_pressure_systolic, blood_pressure_diastolic,
          heart_rate, respiratory_rate, oxygen_saturation
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          vs.patientId,
          vs.nurseId,
          vs.temperature,
          vs.bpSystolic,
          vs.bpDiastolic,
          vs.heartRate,
          vs.respiratoryRate,
          vs.oxygenSaturation,
        ]
      );
      console.log(`  ✓ Created vital signs record`);
    }

    // Create medication administration records
    console.log('\n💉 Creating medication administration records...');
    for (let i = 0; i < 3; i++) {
      await pool.query(
        `INSERT INTO medication_administration (
          patient_id, prescription_id, administered_by_nurse_id,
          scheduled_time, status
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          createdPrescriptions[i].patient_id,
          createdPrescriptions[i].id,
          nurses[i % nurses.length].id,
          new Date().toISOString(),
          i === 0 ? 'pending' : 'administered',
        ]
      );
      console.log(`  ✓ Created medication administration record`);
    }

    // Create audit logs
    console.log('\n📝 Creating audit logs...');
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, 'SYSTEM_SEED', 'Database seeded with initial data', '127.0.0.1')`,
      [admin.id]
    );
    console.log(`  ✓ Created audit log entry`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Patients: ${patients.length}`);
    console.log(`   Appointments: ${appointments.length}`);
    console.log(`   Medical Records: ${medicalRecords.length}`);
    console.log(`   Prescriptions: ${prescriptions.length}`);
    console.log(`   Vital Signs: ${vitalSigns.length}`);
    console.log('\n🔐 Login credentials (all users):');
    console.log('   Email: [user email from above]');
    console.log('   Password: password123\n');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run seeding
seedDatabase();
