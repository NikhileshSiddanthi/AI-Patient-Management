import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: any) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Patient endpoints
  async getPatients() {
    const response = await this.api.get('/patients');
    return response.data;
  }

  async getPatient(id: string) {
    const response = await this.api.get(`/patients/${id}`);
    return response.data;
  }

  async updatePatient(id: string, data: any) {
    const response = await this.api.put(`/patients/${id}`, data);
    return response.data;
  }

  // Appointment endpoints
  async getAppointments(params?: any) {
    const response = await this.api.get('/appointments', { params });
    return response.data;
  }

  async createAppointment(data: any) {
    const response = await this.api.post('/appointments', data);
    return response.data;
  }

  async updateAppointment(id: string, data: any) {
    const response = await this.api.put(`/appointments/${id}`, data);
    return response.data;
  }

  // Medical records
  async getMedicalRecords(patientId?: string) {
    const response = await this.api.get('/medical-records', {
      params: { patientId },
    });
    return response.data;
  }

  // Prescriptions
  async getPrescriptions(patientId?: string) {
    const response = await this.api.get('/prescriptions', {
      params: { patientId },
    });
    return response.data;
  }

  // Notifications
  async getNotifications() {
    const response = await this.api.get('/notifications');
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    const response = await this.api.put(`/notifications/${id}/read`);
    return response.data;
  }

  // AI Services
  async checkSymptoms(symptoms: string[]) {
    const response = await this.api.post('/ai/symptom-checker', { symptoms });
    return response.data;
  }

  async optimizeAppointment(data: any) {
    const response = await this.api.post('/ai/optimize-appointment', data);
    return response.data;
  }

  async getPredictiveAnalytics(patientId: string) {
    const response = await this.api.post('/ai/predictive-analytics', {
      patientId,
      analysisType: 'risk-assessment',
    });
    return response.data;
  }
}

export default new ApiService();
