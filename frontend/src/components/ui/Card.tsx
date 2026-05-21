import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export default function Card({ children, className, title, subtitle, headerAction }: CardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-neutral-800 bg-[#1a1a1a] shadow-sm",
      className
    )}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between border-b border-neutral-800 p-6">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
