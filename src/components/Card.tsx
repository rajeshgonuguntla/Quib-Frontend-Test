import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'standard' | 'elevated';
  className?: string;
}

export function Card({ 
  children, 
  variant = 'standard', 
  className = ''
}: CardProps) {
  const variants = {
    standard: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border border-gray-200 shadow-lg',
  };

  return (
    <div className={`rounded-2xl ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}