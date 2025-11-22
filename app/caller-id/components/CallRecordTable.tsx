import { Phone, Clock, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

interface CallRecord {
  id: number;
  to: string;
  from: string;
  callSid: string;
  status: string;
  timestamp: string;
}

interface CallRecordTableProps {
  callRecords: CallRecord[];
}

const getCallStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in-progress':
    case 'ringing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'queued':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'failed':
    case 'busy':
    case 'no-answer':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCallStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'in-progress':
    case 'ringing':
      return <Loader className="w-4 h-4 animate-spin" />;
    case 'queued':
      return <Clock className="w-4 h-4" />;
    case 'failed':
    case 'busy':
    case 'no-answer':
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

export default function CallRecordTable({ callRecords }: CallRecordTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>From</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>To</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Call ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Timestamp</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {callRecords.map((call, index) => (
              <tr 
                key={call.id} 
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{call.from}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{call.to}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getCallStatusColor(call.status)}`}>
                    {getCallStatusIcon(call.status)}
                    <span className="capitalize">{call.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {call.callSid}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(call.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
