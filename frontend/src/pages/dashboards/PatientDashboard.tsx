import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  Calendar,
  FileText,
  Pill,
  Activity,
  Bell,
  LogOut,
  User,
  Heart,
  Stethoscope,
  Bot,
} from 'lucide-react';
import api from '../../services/api';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [apptRes, presRes, notifRes] = await Promise.all([
        api.getAppointments(),
        api.getPrescriptions(),
        api.getNotifications(),
      ]);
      
      setAppointments(apptRes.data || []);
      setPrescriptions(presRes.data || []);
      setNotifications(notifRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({
    title,
    value,
    icon,
    color,
  }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Upcoming Appointments"
            value="3"
            icon={<Calendar className="h-6 w-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Prescriptions"
            value="5"
            icon={<Pill className="h-6 w-6 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Medical Records"
            value="12"
            icon={<FileText className="h-6 w-6 text-white" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Health Score"
            value="85%"
            icon={<Heart className="h-6 w-6 text-white" />}
            color="bg-pink-500"
          />
        </div>

        {/* AI Features Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="h-8 w-8" />
            <h2 className="text-2xl font-bold">AI Health Assistant</h2>
          </div>
          <p className="mb-4">Get instant health insights powered by AI</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white text-primary-600 rounded-lg px-4 py-3 font-medium hover:bg-gray-100 transition-colors">
              Symptom Checker
            </button>
            <button className="bg-white text-primary-600 rounded-lg px-4 py-3 font-medium hover:bg-gray-100 transition-colors">
              Health Risk Assessment
            </button>
            <button className="bg-white text-primary-600 rounded-lg px-4 py-3 font-medium hover:bg-gray-100 transition-colors">
              AI Appointment Scheduling
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                Upcoming Appointments
              </h3>
              <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                View All
              </button>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 3).map((apt, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{apt.appointmentType || 'General Consultation'}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Dr. {apt.doctorName || 'Smith'} - {apt.appointmentDate}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {apt.status || 'Scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No upcoming appointments</p>
            )}
            <button className="mt-4 w-full btn btn-primary">
              Book New Appointment
            </button>
          </div>

          {/* Active Prescriptions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary-600" />
                Active Prescriptions
              </h3>
              <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                View All
              </button>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : prescriptions.length > 0 ? (
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map((pres, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{pres.medicationName || 'Medication'}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {pres.dosage || '500mg'} - {pres.frequency || 'Twice daily'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Refills: {pres.refillsAllowed || 2} remaining
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No active prescriptions</p>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-600" />
                Recent Notifications
              </h3>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notif, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Bell className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notif.title || 'Notification'}</p>
                      <p className="text-sm text-gray-600">{notif.message || 'You have a new notification'}</p>
                    </div>
                    <span className="text-xs text-gray-500">{notif.createdAt || 'Just now'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No new notifications</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
