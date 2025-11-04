export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  appointmentType?: string;
  reason?: string;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  recordType: string;
  title: string;
  description?: string;
  diagnosis?: string[];
  symptoms?: string[];
  recordedDate: string;
  recordedBy: string;
  aiSummary?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients?: number;
  totalAppointments?: number;
  todayAppointments?: number;
  upcomingAppointments?: number;
  activeP rescriptions?: number;
  pendingResults?: number;
}
