import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, onClose }) => {
  const config = {
    success: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
      Icon: CheckCircle,
    },
    error: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
      Icon: XCircle,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
      Icon: AlertCircle,
    },
    info: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400',
      Icon: Info,
    },
  };

  const { bgColor, textColor, iconColor, Icon } = config[type];

  return (
    <div className={`${bgColor} border-l-4 border-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-400 p-4 rounded-r`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${iconColor} mt-0.5`} />
        <div className="ml-3 flex-1">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${textColor} hover:opacity-70 focus:outline-none`}
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;
