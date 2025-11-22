import { Phone, User, MapPin, Building, Briefcase, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface CallerInfo {
  name?: string;
  type?: string;
  location?: string;
  carrier?: string;
  spamLikelihood?: string;
}

interface CallerLookupCardProps {
  phoneNumber: string;
  timestamp: string;
  callerInfo: CallerInfo;
}

const getSpamBadgeColor = (likelihood: string) => {
  switch (likelihood?.toLowerCase()) {
    case 'high':
      return 'bg-red-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getSpamIcon = (likelihood: string) => {
  switch (likelihood?.toLowerCase()) {
    case 'high':
      return <AlertTriangle className="h-3 w-3" />;
    case 'low':
      return <CheckCircle className="h-3 w-3" />;
    default:
      return <Shield className="h-3 w-3" />;
  }
};

const formatPhoneNumber = (phoneNumber: string) => {
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if it's a 10-digit number
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not standard format
  return phoneNumber;
};

export default function CallerLookupCard({ phoneNumber, timestamp, callerInfo }: CallerLookupCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const spamLevel = callerInfo.spamLikelihood?.toLowerCase() || 'unknown';

  const getHeaderGradient = () => {
    if (spamLevel === 'high') {
      return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    } else if (spamLevel === 'medium') {
      return 'linear-gradient(135deg, #eab308 0%, #f97316 100%)';
    }
    return 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)';
  };

  const getSpamBadgeStyle = () => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 10px',
      borderRadius: '16px',
      fontSize: '10px',
      fontWeight: 'bold',
      color: 'white'
    };

    switch (spamLevel) {
      case 'high':
        return { ...baseStyle, backgroundColor: '#ef4444' };
      case 'medium':
        return { ...baseStyle, backgroundColor: '#eab308' };
      case 'low':
        return { ...baseStyle, backgroundColor: '#22c55e' };
      default:
        return { ...baseStyle, backgroundColor: '#6b7280' };
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      maxWidth: '400px',
      margin: '0 auto',
      transition: 'all 0.3s ease'
    }}>
      {/* Header with Phone Number */}
      <div style={{
        background: getHeaderGradient(),
        padding: '20px 24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              borderRadius: '50%',
              padding: '12px',
              marginRight: '16px'
            }}>
              <Phone style={{ height: '24px', width: '24px', color: 'white' }} />
            </div>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '0.025em',
                margin: 0
              }}>
                {formatPhoneNumber(phoneNumber)}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                marginTop: '4px'
              }}>
                <Clock style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                <span>{formatDate(timestamp)}</span>
              </div>
            </div>
          </div>
          <div style={getSpamBadgeStyle()}>
            {getSpamIcon(spamLevel)}
            <span>{callerInfo.spamLikelihood || 'Unknown'}</span>
          </div>
        </div>
      </div>
      
      {/* Information Grid */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                padding: '8px',
                marginRight: '12px'
              }}>
                <User style={{ height: '16px', width: '16px', color: '#2563eb' }} />
              </div>
              <span style={{ color: '#374151', fontWeight: '500' }}>Name</span>
            </div>
            <span style={{ color: '#111827', fontWeight: '600' }}>
              {callerInfo.name || 'Unknown'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                backgroundColor: '#f3e8ff',
                borderRadius: '50%',
                padding: '8px',
                marginRight: '12px'
              }}>
                <Briefcase style={{ height: '16px', width: '16px', color: '#7c3aed' }} />
              </div>
              <span style={{ color: '#374151', fontWeight: '500' }}>Type</span>
            </div>
            <span style={{ color: '#111827', fontWeight: '600', textTransform: 'capitalize' }}>
              {callerInfo.type || 'Unknown'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                padding: '8px',
                marginRight: '12px'
              }}>
                <MapPin style={{ height: '16px', width: '16px', color: '#16a34a' }} />
              </div>
              <span style={{ color: '#374151', fontWeight: '500' }}>Location</span>
            </div>
            <span style={{ color: '#111827', fontWeight: '600' }}>
              {callerInfo.location || 'Unknown'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                backgroundColor: '#fed7aa',
                borderRadius: '50%',
                padding: '8px',
                marginRight: '12px'
              }}>
                <Shield style={{ height: '16px', width: '16px', color: '#ea580c' }} />
              </div>
              <span style={{ color: '#374151', fontWeight: '500' }}>Carrier</span>
            </div>
            <span style={{ color: '#111827', fontWeight: '600' }}>
              {callerInfo.carrier || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer (Optional) */}
      {spamLevel === 'high' && (
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#fef2f2',
          borderTop: '1px solid #fecaca'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: '#b91c1c',
            fontSize: '14px'
          }}>
            <AlertTriangle style={{ height: '16px', width: '16px', marginRight: '8px' }} />
            <span style={{ fontWeight: '500' }}>High spam probability detected</span>
          </div>
        </div>
      )}
    </div>
  );
}

