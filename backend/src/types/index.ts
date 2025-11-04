// Core Type Definitions for Patient Management System

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';
export type LabResultStatus = 'pending' | 'completed' | 'abnormal';
export type BillingStatus = 'pending' | 'paid' | 'partially_paid' | 'overdue';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface Patient {
  id: string;
  userId: string;
  medicalRecordNumber: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt: Date;
  updated At: Date;
}

export interface MedicalStaff {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization?: string;
  department?: string;
  availableDays?: number[];
  availableStartTime?: string;
  availableEndTime?: string;
  consultationDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  status: AppointmentStatus;
  appointmentType?: string;
  reason?: string;
  notes?: string;
  createdBy: string;
  aiPriorityScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  encounterId?: string;
  recordType: string;
  title: string;
  description?: string;
  diagnosis?: string[];
  symptoms?: string[];
  treatmentPlan?: string;
  medications?: string[];
  recordedBy: string;
  recordedDate: Date;
  attachments?: any;
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  refillsAllowed: number;
  startDate: Date;
  endDate?: Date;
  status: PrescriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  testType: string;
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  status: LabResultStatus;
  testDate: Date;
  resultDate?: Date;
  orderedBy: string;
  notes?: string;
  aiInterpretation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  recordedDate: Date;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordedBy: string;
  notes?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AIAnalytics {
  id: string;
  patientId: string;
  analysisType: string;
  riskScore?: number;
  predictions?: any;
  recommendations?: string[];
  confidenceLevel?: number;
  modelVersion?: string;
  analyzedAt: Date;
  expiresAt?: Date;
}

export interface Billing {
  id: string;
  patientId: string;
  appointmentId?: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: BillingStatus;
  dueDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
  items?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject?: string;
  body: string;
  read: boolean;
  threadId?: string;
  parentMessageId?: string;
  attachments?: any;
  createdAt: Date;
  readAt?: Date;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// AI Feature types
export interface SymptomCheckerRequest {
  symptoms: string[];
  patientId: string;
  additionalInfo?: string;
}

export interface SymptomCheckerResponse {
  possibleConditions: Array<{
    condition: string;
    probability: number;
    severity: string;
    recommendations: string[];
  }>;
  urgencyLevel: string;
  shouldSeekImmediateCare: boolean;
  confidence: number;
}

export interface AppointmentOptimizationRequest {
  patientId: string;
  preferredDates: Date[];
  appointmentType: string;
  urgency?: string;
}

export interface PredictiveAnalyticsRequest {
  patientId: string;
  analysisType: string;
  timeframe?: string;
}

export interface DocumentAnalysisRequest {
  documentId: string;
  extractFields?: string[];
}

export interface TreatmentRecommendationRequest {
  patientId: string;
  diagnosis: string;
  symptoms: string[];
  medicalHistory?: string[];
}
