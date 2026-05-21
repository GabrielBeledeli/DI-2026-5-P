import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-neutral-800 text-neutral-300',
    success: 'bg-green-900/30 text-green-400 border border-green-900/50',
    warning: 'bg-orange-900/30 text-orange-400 border border-orange-900/50',
    error: 'bg-red-900/30 text-red-400 border border-red-900/50',
    info: 'bg-blue-900/30 text-blue-400 border border-blue-900/50',
    outline: 'border border-neutral-700 text-neutral-400',
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
