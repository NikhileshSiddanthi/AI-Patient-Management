import React, { useState } from 'react';
import { Bot, Send, Loader, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface SymptomResult {
  condition: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  possibleDiagnoses: string[];
}

const AISymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      setError('Please describe your symptoms');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await api.post('/api/ai/symptom-check', {
        symptoms: symptoms.trim(),
      });

      setResult(response.data);
    } catch (err: any) {
      console.error('Error checking symptoms:', err);
      setError(err.response?.data?.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case 'medium':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Symptom Checker</h2>
          <p className="text-sm text-gray-600">Describe your symptoms for instant AI-powered analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms in detail (e.g., 'I have a fever, headache, and sore throat for the past 2 days...')"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            disabled={loading}
          />
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            This is not a substitute for professional medical advice
          </p>
          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Analyze Symptoms</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <LoadingSpinner text="AI is analyzing your symptoms..." />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Severity Alert */}
          <div className={`p-4 border-2 rounded-lg ${getSeverityColor(result.severity)}`}>
            <div className="flex items-start space-x-3">
              {getSeverityIcon(result.severity)}
              <div className="flex-1">
                <h3 className="font-semibold text-lg capitalize">
                  {result.severity} Severity Level
                </h3>
                <p className="text-sm mt-1">
                  {result.severity === 'high' && 'Please seek immediate medical attention.'}
                  {result.severity === 'medium' && 'Consider scheduling an appointment with your doctor.'}
                  {result.severity === 'low' && 'Monitor symptoms and consult a doctor if they persist.'}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Condition */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Likely Condition</h3>
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-primary-600">{result.condition}</p>
              <div className="flex items-center space-x-1">
                <div className="w-full bg-gray-200 rounded-full h-2 w-32">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600">{result.confidence}%</span>
              </div>
            </div>
          </div>

          {/* Possible Diagnoses */}
          {result.possibleDiagnoses && result.possibleDiagnoses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Other Possible Conditions</h3>
              <ul className="space-y-2">
                {result.possibleDiagnoses.map((diagnosis, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{diagnosis}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Important Disclaimer</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This AI-powered analysis is for informational purposes only and should not replace 
                  professional medical advice, diagnosis, or treatment. Always consult with a qualified 
                  healthcare provider for proper medical evaluation.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSymptoms('');
                setResult(null);
                setError(null);
              }}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Check New Symptoms
            </button>
            <button className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISymptomChecker;
