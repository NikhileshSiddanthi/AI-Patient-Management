import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import {
  Activity,
  Users,
  Pill,
  Thermometer,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  roomNumber?: string;
  condition?: string;
}

interface VitalSign {
  id: string;
  patientId: string;
  patientName: string;
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  oxygenLevel: number;
  recordedAt: string;
  status: 'normal' | 'warning' | 'critical';
}

interface Medication {
  id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  scheduledTime: string;
  status: 'pending' | 'administered' | 'missed';
}

const NurseDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'vitals' | 'medications'>('overview');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const [stats, setStats] = useState({
    activePatients: 0,
    criticalAlerts: 0,
    pendingMedications: 0,
    tasksCompleted: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assigned patients
      const patientsRes = await api.get('/api/patients?nurseId=' + user?.id);
      const patientsData = patientsRes.data || [];
      setPatients(patientsData);

      // Fetch vital signs
      const vitalsRes = await api.get('/api/vital-signs?nurseId=' + user?.id);
      const vitalsData = vitalsRes.data || [];
      setVitalSigns(vitalsData);

      // Fetch medications
      const medsRes = await api.get('/api/medications?nurseId=' + user?.id);
      const medsData = medsRes.data || [];
      setMedications(medsData);

      // Calculate stats
      const critical = vitalsData.filter((v: VitalSign) => v.status === 'critical').length;
      const pending = medsData.filter((m: Medication) => m.status === 'pending').length;
      const completed = medsData.filter((m: Medication) => m.status === 'administered').length;

      setStats({
        activePatients: patientsData.length,
        criticalAlerts: critical,
        pendingMedications: pending,
        tasksCompleted: completed,
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationAction = async (medicationId: string, action: 'administer' | 'skip') => {
    try {
      const status = action === 'administer' ? 'administered' : 'missed';
      await api.patch(`/api/medications/${medicationId}`, { status });
      fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} medication`);
    }
  };

  const criticalVitals = vitalSigns.filter((v) => v.status === 'critical');
  const warningVitals = vitalSigns.filter((v) => v.status === 'warning');

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
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-2 text-gray-600">Patient care and monitoring dashboard</p>
        </div>

        {error && (
          <div className="mb-6">
            <AlertMessage type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Critical Alerts Banner */}
        {criticalVitals.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <p className="text-red-800 font-semibold">
                  {criticalVitals.length} Critical Alert{criticalVitals.length > 1 ? 's' : ''}
                </p>
                <p className="text-red-700 text-sm">
                  Immediate attention required for patient vital signs
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activePatients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Medications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingMedications}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Pill className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Tasks Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.tasksCompleted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'patients', label: 'Patients', icon: Users },
              { id: 'vitals', label: 'Vital Signs', icon: Heart },
              { id: 'medications', label: 'Medications', icon: Pill },
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Vital Signs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                Critical Vital Signs
              </h2>
              {criticalVitals.length > 0 ? (
                <div className="space-y-3">
                  {criticalVitals.map((vital) => (
                    <div key={vital.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-semibold text-gray-900">{vital.patientName}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Temp:</span>
                          <span className="ml-1 font-medium">{vital.temperature}°F</span>
                        </div>
                        <div>
                          <span className="text-gray-600">HR:</span>
                          <span className="ml-1 font-medium">{vital.heartRate} bpm</span>
                        </div>
                        <div>
                          <span className="text-gray-600">BP:</span>
                          <span className="ml-1 font-medium">{vital.bloodPressure}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">O2:</span>
                          <span className="ml-1 font-medium">{vital.oxygenLevel}%</span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">{vital.recordedAt}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No critical alerts</p>
              )}
            </div>

            {/* Pending Medications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-6 w-6 text-yellow-500 mr-2" />
                Pending Medications
              </h2>
              {medications.filter(m => m.status === 'pending').length > 0 ? (
                <div className="space-y-3">
                  {medications.filter(m => m.status === 'pending').slice(0, 5).map((med) => (
                    <div key={med.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{med.patientName}</p>
                          <p className="text-sm text-gray-600">{med.medicationName}</p>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {med.scheduledTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {med.dosage} - {med.frequency}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMedicationAction(med.id, 'administer')}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Administer
                        </button>
                        <button
                          onClick={() => handleMedicationAction(med.id, 'skip')}
                          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No pending medications</p>
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Assigned Patients</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {patients.map((patient) => (
                <div key={patient.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    {patient.roomNumber && (
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                        Room {patient.roomNumber}
                      </span>
                    )}
                  </div>
                  {patient.condition && (
                    <p className="text-sm text-gray-600 mb-3">{patient.condition}</p>
                  )}
                  <button className="w-full px-3 py-2 text-sm text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50">
                    <Eye className="h-4 w-4 inline mr-1" />
                    View Details
                  </button>
                </div>
              ))}
              {patients.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No patients assigned</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vital Signs Tab */}
        {activeTab === 'vitals' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Vital Signs Monitoring</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Plus className="h-5 w-5" />
                <span>Record Vitals</span>
              </button>
            </div>
            <div className="space-y-3">
              {vitalSigns.map((vital) => (
                <div
                  key={vital.id}
                  className={`p-4 border rounded-lg ${
                    vital.status === 'critical'
                      ? 'bg-red-50 border-red-300'
                      : vital.status === 'warning'
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{vital.patientName}</p>
                      <p className="text-xs text-gray-500 mt-1">{vital.recordedAt}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        vital.status === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : vital.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {vital.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Temperature</p>
                        <p className="text-sm font-semibold">{vital.temperature}°F</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Blood Pressure</p>
                        <p className="text-sm font-semibold">{vital.bloodPressure}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Heart Rate</p>
                        <p className="text-sm font-semibold">{vital.heartRate} bpm</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Oxygen Level</p>
                        <p className="text-sm font-semibold">{vital.oxygenLevel}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {vitalSigns.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No vital signs recorded</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Medication Administration</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Plus className="h-5 w-5" />
                <span>Add Medication</span>
              </button>
            </div>
            <div className="space-y-3">
              {medications.map((med) => (
                <div key={med.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{med.patientName}</p>
                      <p className="text-sm text-gray-600">{med.medicationName}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          med.status === 'administered'
                            ? 'bg-green-100 text-green-800'
                            : med.status === 'missed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {med.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{med.scheduledTime}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {med.dosage} - {med.frequency}
                  </p>
                  {med.status === 'pending' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleMedicationAction(med.id, 'administer')}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Administer
                      </button>
                      <button
                        onClick={() => handleMedicationAction(med.id, 'skip')}
                        className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                      >
                        Skip
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {medications.length === 0 && (
                <div className="text-center py-12">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No medications scheduled</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseDashboard;
