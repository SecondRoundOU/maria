'use client';

import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
}

export default function FeatureCard({ title, description, href, icon: Icon, gradient }: FeatureCardProps) {
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  };

  const handleClick = () => {
    window.location.href = href;
  };

  return (
    <div 
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Header with Icon */}
      <div style={{
        background: gradient,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)',
          borderRadius: '50%',
          padding: '12px',
          marginRight: '16px'
        }}>
          <Icon style={{ height: '24px', width: '24px', color: 'white' }} />
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'white',
          margin: 0
        }}>
          {title}
        </h3>
      </div>
      
      {/* Content */}
      <div style={{ padding: '24px' }}>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '0 0 20px 0'
        }}>
          {description}
        </p>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          textDecoration: 'none',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
        >
          Get Started →
        </div>
      </div>
    </div>
  );
}
