import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import {
  Calendar,
  Users,
  FileText,
  Stethoscope,
  Clock,
  Search,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  bloodType?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  type: string;
  reason: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  treatment: string;
  recordDate: string;
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'appointments' | 'records'>('overview');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReviews: 0,
    completedToday: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch patients assigned to this doctor
      const patientsRes = await api.get('/api/patients');
      const patientsData = patientsRes.data || [];
      setPatients(patientsData);

      // Fetch appointments for this doctor
      const appointmentsRes = await api.get(`/api/appointments?doctorId=${user?.id}`);
      const appointmentsData = appointmentsRes.data || [];
      setAppointments(appointmentsData);

      // Fetch medical records
      const recordsRes = await api.get(`/api/medical-records?doctorId=${user?.id}`);
      const recordsData = recordsRes.data || [];
      setMedicalRecords(recordsData);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointmentsData.filter(
        (apt: Appointment) => apt.appointmentDate === today
      );
      const completedToday = todayAppts.filter(
        (apt: Appointment) => apt.status === 'completed'
      );
      const pending = appointmentsData.filter(
        (apt: Appointment) => apt.status === 'scheduled'
      );

      setStats({
        totalPatients: patientsData.length,
        todayAppointments: todayAppts.length,
        pendingReviews: pending.length,
        completedToday: completedToday.length,
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'complete' | 'cancel') => {
    try {
      const status = action === 'complete' ? 'completed' : 'cancelled';
      await api.patch(`/api/appointments/${appointmentId}`, { status });
      fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} appointment`);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayAppointments = appointments.filter(
    (apt) => apt.appointmentDate === new Date().toISOString().split('T')[0]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Dr. {user?.lastName}
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your patients today
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <AlertMessage type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingReviews}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedToday}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Stethoscope },
              { id: 'patients', label: 'Patients', icon: Users },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'records', label: 'Medical Records', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Today's Appointments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Appointments</h2>
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{apt.patientName}</p>
                        <p className="text-sm text-gray-600">{apt.type} - {apt.reason}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {apt.appointmentTime}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            apt.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                        {apt.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleAppointmentAction(apt.id, 'complete')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Complete"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleAppointmentAction(apt.id, 'cancel')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Cancel"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
              )}
            </div>

            {/* Recent Medical Records */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Medical Records</h2>
              {medicalRecords.slice(0, 5).length > 0 ? (
                <div className="space-y-3">
                  {medicalRecords.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{record.patientName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{record.recordDate}</p>
                      </div>
                      <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent medical records</p>
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Patient List</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  <Plus className="h-5 w-5" />
                  <span>Add Patient</span>
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blood Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{patient.email}</div>
                        <div className="text-sm text-gray-500">{patient.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.dateOfBirth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {patient.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.bloodType || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-3">
                          <Eye className="h-5 w-5 inline" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No patients found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">All Appointments</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Plus className="h-5 w-5" />
                <span>Schedule Appointment</span>
              </button>
            </div>
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{apt.patientName}</p>
                    <p className="text-sm text-gray-600">{apt.type} - {apt.reason}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {apt.appointmentDate} at {apt.appointmentTime}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        apt.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : apt.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                    {apt.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleAppointmentAction(apt.id, 'complete')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(apt.id, 'cancel')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No appointments scheduled</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Medical Records</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Plus className="h-5 w-5" />
                <span>New Record</span>
              </button>
            </div>
            <div className="space-y-3">
              {medicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{record.patientName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Diagnosis:</strong> {record.diagnosis}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Treatment:</strong> {record.treatment}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{record.recordDate}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                      <Edit className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {medicalRecords.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No medical records found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
