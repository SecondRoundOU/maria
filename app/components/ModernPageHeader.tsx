'use client';

import { LucideIcon } from 'lucide-react';

interface ModernPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
}

export default function ModernPageHeader({ 
  title, 
  description, 
  icon: Icon, 
  gradient = 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)' 
}: ModernPageHeaderProps) {
  return (
    <div style={{
      background: gradient,
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '32px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)',
          borderRadius: '50%',
          padding: '16px',
          marginRight: '20px'
        }}>
          <Icon style={{ height: '32px', width: '32px', color: 'white' }} />
        </div>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            letterSpacing: '-0.025em'
          }}>
            {title}
          </h1>
        </div>
      </div>
      <p style={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '16px',
        lineHeight: '1.6',
        margin: 0,
        maxWidth: '600px'
      }}>
        {description}
      </p>
    </div>
  );
}
