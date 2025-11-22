import { LucideIcon, Trash2 } from 'lucide-react';

interface ModernItemCardProps {
  title: string;
  description?: string;
  metadata?: { label: string; value: string; icon?: LucideIcon }[];
  onDelete: () => void;
  onAction?: () => void;
  actionText?: string;
  actionColor?: string;
  gradient?: string;
  completed?: boolean;
}

export default function ModernItemCard({ 
  title, 
  description, 
  metadata = [], 
  onDelete, 
  onAction,
  actionText,
  actionColor = '#2563eb',
  gradient = 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
  completed = false
}: ModernItemCardProps) {
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
  };

  const handleActionMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = `0 4px 12px ${actionColor}40`;
  };

  const handleActionMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  const handleDeleteMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#dc2626';
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
  };

  const handleDeleteMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#ef4444';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div 
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        opacity: completed ? 0.7 : 1
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div style={{
        background: gradient,
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
          margin: 0,
          textDecoration: completed ? 'line-through' : 'none'
        }}>
          {title}
        </h3>
      </div>
      
      {/* Content */}
      <div style={{ padding: '20px' }}>
        {description && (
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.5',
            margin: '0 0 16px 0',
            textDecoration: completed ? 'line-through' : 'none'
          }}>
            {description}
          </p>
        )}
        
        {/* Metadata */}
        {metadata.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {metadata.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                color: '#6b7280'
              }}>
                {item.icon && (
                  <item.icon style={{
                    height: '14px',
                    width: '14px',
                    marginRight: '8px',
                    color: '#9ca3af'
                  }} />
                )}
                <span style={{ fontWeight: '500', marginRight: '8px' }}>{item.label}:</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          {onAction && actionText && (
            <button
              onClick={onAction}
              style={{
                backgroundColor: actionColor,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: 1
              }}
              onMouseEnter={handleActionMouseEnter}
              onMouseLeave={handleActionMouseLeave}
            >
              {actionText}
            </button>
          )}
          
          <button
            onClick={onDelete}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={handleDeleteMouseEnter}
            onMouseLeave={handleDeleteMouseLeave}
          >
            <Trash2 style={{ height: '14px', width: '14px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
